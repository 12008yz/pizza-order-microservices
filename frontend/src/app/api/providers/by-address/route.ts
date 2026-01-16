import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const PROVIDER_SERVICE_URL = process.env.PROVIDER_SERVICE_URL || 'http://provider-service:3003';
const AVAILABILITY_SERVICE_URL = process.env.AVAILABILITY_SERVICE_URL || 'http://availability-service:3006';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const buildingId = searchParams.get('buildingId');
    const cityId = searchParams.get('cityId');
    const streetId = searchParams.get('streetId');

    // Если есть buildingId - используем точную проверку доступности
    if (buildingId) {
      try {
        // Пробуем использовать Availability Service (если реализован)
        const availabilityResponse = await axios.get(
          `${AVAILABILITY_SERVICE_URL}/api/availability/providers/${buildingId}`
        );

        if (availabilityResponse.data.success) {
          return NextResponse.json(availabilityResponse.data);
        }
      } catch (error: any) {
        // Если Availability Service не реализован, используем Coverage Service
        console.log('Availability Service not available, using Coverage Service');
      }
    }

    // Используем Coverage Service через Provider Service
    const city = searchParams.get('city');
    const street = searchParams.get('street');
    const house = searchParams.get('house');

    if (city) {
      const response = await axios.get(`${PROVIDER_SERVICE_URL}/api/coverage/check`, {
        params: { city, street, house },
      });

      if (response.data.success) {
        return NextResponse.json(response.data);
      }
    }

    // Если нет параметров адреса, возвращаем всех активных провайдеров
    const response = await axios.get(`${PROVIDER_SERVICE_URL}/api/providers`, {
      params: { active: true },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.response?.data || error.message },
      { status: error.response?.status || 500 }
    );
  }
}
