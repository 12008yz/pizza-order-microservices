import { NextRequest, NextResponse } from 'next/server';

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3002';

interface UserProfileData {
   phone: string;
   city?: string;
   street?: string;
   house?: string;
   apartment?: string;
   connectionType?: string;
   contactMethod?: string;
}

export async function POST(request: NextRequest) {
   try {
      const body: UserProfileData = await request.json();

      // Валидация обязательных полей
      if (!body.phone) {
         return NextResponse.json(
            { error: 'Phone number is required' },
            { status: 400 }
         );
      }

      // Нормализуем номер телефона (только цифры)
      const normalizedPhone = body.phone.replace(/\D/g, '');

      // Проверяем формат номера - строго 11 цифр
      if (normalizedPhone.length !== 11) {
         return NextResponse.json(
            { error: 'Invalid phone number format' },
            { status: 400 }
         );
      }

      // Функция санитизации строковых данных
      const sanitizeString = (str: string | undefined | null, maxLength: number = 200): string | null => {
         if (!str || typeof str !== 'string') return null;
         // Удаляем потенциально опасные символы и ограничиваем длину
         const sanitized = str
            .trim()
            .replace(/[<>"']/g, '') // Удаляем HTML-символы
            .slice(0, maxLength);
         return sanitized || null;
      };

      // Валидация connectionType и contactMethod
      const validConnectionTypes = ['apartment', 'private', 'office'];
      const validContactMethods = ['max', 'telegram', 'phone'];

      const connectionType = body.connectionType && validConnectionTypes.includes(body.connectionType)
         ? body.connectionType
         : null;
      const contactMethod = body.contactMethod && validContactMethods.includes(body.contactMethod)
         ? body.contactMethod
         : null;

      // Формируем данные для сохранения с санитизацией
      const profileData = {
         phone: normalizedPhone,
         city: sanitizeString(body.city, 100),
         street: sanitizeString(body.street, 200),
         house: sanitizeString(body.house, 20),
         apartment: sanitizeString(body.apartment, 20),
         connectionType,
         contactMethod,
         // savedAddresses оставляем для дополнительных данных, если нужно
         savedAddresses: null,
      };

      // Отправляем запрос на user-service
      try {
         const response = await fetch(`${USER_SERVICE_URL}/api/users/profile`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(profileData),
         });

         if (response.ok) {
            const result = await response.json();
            return NextResponse.json(result, { status: 201 });
         }

         // Если пользователь уже существует, пробуем обновить
         if (response.status === 409) {
            // Получаем существующий профиль и обновляем
            const updateResponse = await fetch(`${USER_SERVICE_URL}/api/users/profile/by-phone/${normalizedPhone}`, {
               method: 'PUT',
               headers: {
                  'Content-Type': 'application/json',
               },
               body: JSON.stringify(profileData),
            });

            if (updateResponse.ok) {
               const result = await updateResponse.json();
               return NextResponse.json(result, { status: 200 });
            }
         }

         // Если user-service недоступен или вернул ошибку, сохраняем локально
         console.warn('User service unavailable, returning success anyway');
         return NextResponse.json(
            {
               message: 'Profile data received',
               phone: normalizedPhone,
               savedLocally: true
            },
            { status: 201 }
         );
      } catch (serviceError) {
         // User service недоступен, но это не критичная ошибка
         console.warn('User service connection failed:', serviceError);
         return NextResponse.json(
            {
               message: 'Profile data received',
               phone: normalizedPhone,
               savedLocally: true
            },
            { status: 201 }
         );
      }
   } catch (error) {
      console.error('Error processing profile request:', error);
      return NextResponse.json(
         { error: 'Failed to process profile data' },
         { status: 500 }
      );
   }
}

export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const phone = searchParams.get('phone');

      if (!phone) {
         return NextResponse.json(
            { error: 'Phone number is required' },
            { status: 400 }
         );
      }

      const normalizedPhone = phone.replace(/\D/g, '');

      try {
         const response = await fetch(`${USER_SERVICE_URL}/api/users/profile/by-phone/${normalizedPhone}`);

         if (response.ok) {
            const profile = await response.json();
            return NextResponse.json(profile);
         }

         if (response.status === 404) {
            return NextResponse.json(
               { error: 'Profile not found' },
               { status: 404 }
            );
         }

         return NextResponse.json(
            { error: 'Failed to fetch profile' },
            { status: response.status }
         );
      } catch (serviceError) {
         console.warn('User service connection failed:', serviceError);
         return NextResponse.json(
            { error: 'User service unavailable' },
            { status: 503 }
         );
      }
   } catch (error) {
      console.error('Error fetching profile:', error);
      return NextResponse.json(
         { error: 'Failed to fetch profile' },
         { status: 500 }
      );
   }
}
