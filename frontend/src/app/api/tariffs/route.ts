import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const PROVIDER_SERVICE_URL = process.env.PROVIDER_SERVICE_URL || 'http://localhost:3003';

const isConnectionError = (err: unknown): boolean => {
  const code = (err as { code?: string })?.code;
  return code === 'ECONNREFUSED' || code === 'ECONNRESET' || code === 'ETIMEDOUT' || code === 'ENOTFOUND';
};

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const url = queryString
      ? `${PROVIDER_SERVICE_URL}/api/tariffs?${queryString}`
      : `${PROVIDER_SERVICE_URL}/api/tariffs`;

    const response = await axios.get(url, { timeout: 10000 });
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const err = error as { response?: { status: number; data?: unknown }; code?: string; message?: string };

    // Сервис тарифов недоступен (не запущен / сеть) — возвращаем пустой список, чтобы страница не падала
    if (isConnectionError(err)) {
      console.warn(
        `[api/tariffs] Provider service unreachable (${err.code}). ` +
          `Start provider-service (e.g. docker-compose up provider-service) or it will run with empty tariffs.`
      );
      return NextResponse.json({ success: true, data: [] });
    }

    // Ответ от провайдера с ошибкой — пробрасываем статус и тело
    if (err.response) {
      return NextResponse.json(
        { success: false, error: err.response.data ?? err.message },
        { status: err.response.status }
      );
    }

    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}


