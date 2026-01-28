import { UserSensitiveData } from '../models/UserSensitiveData';
import { encryptString, decryptString } from '../utils/encryption';
import { logger } from '../utils/logger';

export interface SensitiveDataInput {
  passportData?: string | null;
  snils?: string | null;
  inn?: string | null;
  extra?: Record<string, unknown> | string | null;
}

export interface SensitiveDataOutput {
  passportData?: string | null;
  snils?: string | null;
  inn?: string | null;
  extra?: Record<string, unknown> | string | null;
}

export class SensitiveDataService {
  /**
   * Сохранить или обновить чувствительные данные по телефону.
   * Телефон должен быть НОРМАЛИЗОВАН (только цифры).
   */
  async saveOrUpdateByPhone(phone: string, data: SensitiveDataInput): Promise<void> {
    if (!phone) {
      throw new Error('Phone is required for sensitive data');
    }

    const passportDataEnc = data.passportData ? encryptString(data.passportData) : null;
    const snilsEnc = data.snils ? encryptString(data.snils) : null;
    const innEnc = data.inn ? encryptString(data.inn) : null;

    let extraEnc: string | null = null;
    if (data.extra) {
      const asString =
        typeof data.extra === 'string' ? data.extra : JSON.stringify(data.extra);
      extraEnc = encryptString(asString);
    }

    const existing = await UserSensitiveData.findOne({ where: { phone } });

    if (!existing) {
      await UserSensitiveData.create({
        phone,
        passportDataEnc,
        snilsEnc,
        innEnc,
        extraEnc,
      });
      logger.info('Created sensitive data record for user (phone masked)', {
        phoneSuffix: phone.slice(-2),
      });
      return;
    }

    await existing.update({
      passportDataEnc: passportDataEnc ?? existing.passportDataEnc,
      snilsEnc: snilsEnc ?? existing.snilsEnc,
      innEnc: innEnc ?? existing.innEnc,
      extraEnc: extraEnc ?? existing.extraEnc,
    });

    logger.info('Updated sensitive data record for user (phone masked)', {
      phoneSuffix: phone.slice(-2),
    });
  }

  /**
   * Получить расшифрованные чувствительные данные по телефону.
   * ДОЛЖНО вызываться только после проверки прав доступа (RBAC).
   */
  async getByPhone(phone: string): Promise<SensitiveDataOutput | null> {
    if (!phone) {
      return null;
    }

    const record = await UserSensitiveData.findOne({ where: { phone } });
    if (!record) {
      return null;
    }

    let extra: SensitiveDataOutput['extra'] = null;
    if (record.extraEnc) {
      const decoded = decryptString(record.extraEnc);
      try {
        extra = JSON.parse(decoded);
      } catch {
        extra = decoded;
      }
    }

    return {
      passportData: record.passportDataEnc
        ? decryptString(record.passportDataEnc)
        : null,
      snils: record.snilsEnc ? decryptString(record.snilsEnc) : null,
      inn: record.innEnc ? decryptString(record.innEnc) : null,
      extra,
    };
  }
}

