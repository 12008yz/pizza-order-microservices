import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  // Читаем переменную окружения внутри функции для правильной работы в runtime
  const LOCATION_SERVICE_URL =
    process.env.LOCATION_SERVICE_URL || 'http://localhost:3005';

  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || 'regions';
    const queryParams = new URLSearchParams();

    // Копируем все query параметры кроме endpoint, пропуская пустые значения
    searchParams.forEach((value, key) => {
      if (key !== 'endpoint' && value && value.trim()) {
        queryParams.append(key, value.trim());
      }
    });

    // Для autocomplete и search проверяем что q не пустой
    if ((endpoint === 'autocomplete' || endpoint === 'search') && !queryParams.get('q')) {
      return NextResponse.json({
        success: true,
        data: endpoint === 'search' ? { local: [], coverage: [] } : [],
      });
    }

    const url = `${LOCATION_SERVICE_URL}/api/locations/${endpoint}?${queryParams.toString()}`;

    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Location API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.response?.data?.error || error.message || 'Location service error',
      },
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const LOCATION_SERVICE_URL =
    process.env.LOCATION_SERVICE_URL || 'http://localhost:3005';

  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || 'cities';
    const body = await request.json();

    const url = `${LOCATION_SERVICE_URL}/api/locations/${endpoint}`;

    const response = await axios.post(url, body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Location API POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.response?.data?.error || error.message || 'Location service error',
      },
      { status: error.response?.status || 500 }
    );
  }
}
