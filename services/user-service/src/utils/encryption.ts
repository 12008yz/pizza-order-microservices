import crypto from 'crypto';
import { logger } from '../utils/logger';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 бит, рекомендуемый размер для GCM

// Ключ шифрования для чувствительных данных.
// В production ОБЯЗАТЕЛЬНО задать сильный ключ через переменную окружения.
const RAW_KEY = process.env.DATA_ENCRYPTION_KEY;

if (!RAW_KEY) {
  logger.warn(
    'WARNING: DATA_ENCRYPTION_KEY is not set. Using weak default key. This is INSECURE in production!'
  );
}

// Для упрощения: трактуем ключ как строку и приводим к 32 байтам через хэш.
// В бою лучше хранить уже готовый 32-байтовый ключ (base64/hex) в секрет-менеджере.
const KEY = crypto.createHash('sha256').update(RAW_KEY || 'weak-default-key-change-in-prod').digest();

export interface EncryptedPayload {
  iv: string;
  ciphertext: string;
  authTag: string;
}

export function encryptString(plainText: string): string {
  if (!plainText) {
    return '';
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const payload: EncryptedPayload = {
    iv: iv.toString('base64'),
    ciphertext: encrypted.toString('base64'),
    authTag: authTag.toString('base64'),
  };

  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64');
}

export function decryptString(encryptedBase64: string): string {
  if (!encryptedBase64) {
    return '';
  }

  try {
    const json = Buffer.from(encryptedBase64, 'base64').toString('utf8');
    const payload = JSON.parse(json) as EncryptedPayload;

    const iv = Buffer.from(payload.iv, 'base64');
    const ciphertext = Buffer.from(payload.ciphertext, 'base64');
    const authTag = Buffer.from(payload.authTag, 'base64');

    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (error) {
    logger.error('Failed to decrypt sensitive data', { error });
    return '';
  }
}

