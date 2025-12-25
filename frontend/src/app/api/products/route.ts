import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://product-service:3003';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const url = queryString
      ? `${PRODUCT_SERVICE_URL}/api/products?${queryString}`
      : `${PRODUCT_SERVICE_URL}/api/products`;

    const response = await axios.get(url);
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.response?.data || error.message },
      { status: error.response?.status || 500 }
    );
  }
}

