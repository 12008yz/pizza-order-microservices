import axios, { AxiosInstance, AxiosError } from 'axios';
import { logger } from './logger';

/**
 * Создает настроенный HTTP клиент с retry логикой
 * @param baseURL - Базовый URL сервиса
 * @param timeout - Таймаут запроса в миллисекундах (по умолчанию 10000)
 * @returns Настроенный экземпляр axios
 */
export function createHttpClient(baseURL: string, timeout: number = 10000): AxiosInstance {
   const client = axios.create({
      baseURL,
      timeout,
      headers: {
         'Content-Type': 'application/json',
      },
   });

   // Добавляем interceptor для логирования ошибок
   client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
         const config = error.config as any;

         // Если это первая попытка, устанавливаем счетчик
         if (!config.__retryCount) {
            config.__retryCount = 0;
         }

         // Retry логика для сетевых ошибок и 5xx ошибок
         const shouldRetry =
            (!error.response || (error.response.status >= 500 && error.response.status < 600)) &&
            config.__retryCount < 3;

         if (shouldRetry) {
            config.__retryCount += 1;
            const delay = Math.min(1000 * Math.pow(2, config.__retryCount - 1), 5000);

            logger.warn(`Retrying request to ${baseURL}${config.url} (attempt ${config.__retryCount})`, {
               error: error.message,
               delay,
            });

            await new Promise(resolve => setTimeout(resolve, delay));
            return client(config);
         }

         // Логируем финальную ошибку
         logger.error(`HTTP request failed: ${baseURL}${config?.url}`, {
            method: config?.method,
            status: error.response?.status,
            error: error.message,
         });

         return Promise.reject(error);
      }
   );

   return client;
}

/**
 * Безопасный вызов сервиса с обработкой ошибок
 * @param serviceCall - Функция, выполняющая запрос к сервису
 * @param fallback - Значение по умолчанию при ошибке (опционально)
 * @param errorMessage - Сообщение для логирования
 * @returns Результат вызова сервиса или fallback
 */
export async function callService<T>(
   serviceCall: () => Promise<T>,
   fallback?: T,
   errorMessage?: string
): Promise<T> {
   try {
      return await serviceCall();
   } catch (error: any) {
      logger.error(errorMessage || 'Service call failed', {
         error: error.message,
         status: error.response?.status,
      });

      if (fallback !== undefined) {
         return fallback;
      }
      throw error;
   }
}
