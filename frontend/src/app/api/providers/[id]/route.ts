import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const PROVIDER_SERVICE_URL = process.env.PROVIDER_SERVICE_URL || 'http://localhost:3003';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const response = await axios.get(`${PROVIDER_SERVICE_URL}/api/providers/${id}`);
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.response?.data || error.message },
      { status: error.response?.status || 500 }
    );
  }
}
