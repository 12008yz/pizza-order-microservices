import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const AVAILABILITY_SERVICE_URL =
   process.env.AVAILABILITY_SERVICE_URL || 'http://localhost:3006';

/**
 * POST /api/availability/check
 * Проверка доступности провайдеров по адресу
 */
export async function POST(req: NextRequest) {
   try {
      const body = await req.json();

      const response = await axios.post(
         `${AVAILABILITY_SERVICE_URL}/api/availability/check`,
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
            error: error.response?.data?.error || error.message || 'Availability service error',
         },
         { status: error.response?.status || 500 }
      );
   }
}
