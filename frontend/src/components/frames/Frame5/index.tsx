'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEquipment } from '../../../contexts/EquipmentContext';
import { AddressProvider, useAddress } from '../../../contexts/AddressContext';
import { ordersService } from '../../../services';
import Input from '../../common/Input';
import Button from '../../common/Button';
import { HomeIcon } from '../../common/icons';
import type { CreateOrderData } from '../../../services/orders.service';

const SELECTED_TARIFF_KEY = 'selectedTariff';

interface SelectedTariff {
  id: number;
  providerId: number;
  providerName?: string;
  tariffName?: string;
  price?: string;
  priceValue?: number;
}

function buildAddressString(
  city?: string,
  street?: string,
  houseNumber?: string,
  apartmentNumber?: string
): string {
  const parts = [city, street, houseNumber, apartmentNumber].filter(Boolean);
  return parts.join(', ') || '';
}

function Frame5Content() {
  const router = useRouter();
  const { equipmentState } = useEquipment();
  const { addressData } = useAddress();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [comment, setComment] = useState('');
  const [selectedTariff, setSelectedTariff] = useState<SelectedTariff | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SELECTED_TARIFF_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SelectedTariff;
        setSelectedTariff(parsed);
      }
    } catch {
      setSelectedTariff(null);
    }
  }, []);

  useEffect(() => {
    const str = buildAddressString(
      addressData.city,
      addressData.street,
      addressData.houseNumber,
      addressData.apartmentNumber
    );
    if (str && !address) setAddress(str);
  }, [addressData.city, addressData.street, addressData.houseNumber, addressData.apartmentNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTariff) {
      setSubmitError('Сначала выберите тариф на странице провайдеров.');
      return;
    }
    if (!fullName.trim()) {
      setSubmitError('Укажите ФИО.');
      return;
    }
    if (!phone.trim()) {
      setSubmitError('Укажите номер телефона.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload: CreateOrderData = {
        providerId: selectedTariff.providerId,
        tariffId: selectedTariff.id,
        fullName: fullName.trim(),
        phone: phone.trim().replace(/\D/g, ''),
        email: email.trim() || undefined,
        addressString: address.trim() || undefined,
        notes: comment.trim() || undefined,
      };

      if (equipmentState?.router) {
        payload.routerNeed = equipmentState.router.need ?? undefined;
        payload.routerPurchase = equipmentState.router.purchase ?? undefined;
        payload.routerOperator = equipmentState.router.operator ?? undefined;
        payload.routerConfig = equipmentState.router.config ?? undefined;
      }

      const res = await ordersService.createOrder(payload);
      if (res.success && res.data) {
        sessionStorage.removeItem(SELECTED_TARIFF_KEY);
        router.push('/order/success');
        return;
      }
      setSubmitError(res.error || 'Не удалось создать заявку.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка при отправке заявки.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedTariff) {
    return (
      <div
        className="relative w-full max-w-[400px] mx-auto bg-[#F5F5F5] flex flex-col items-center justify-center"
        style={{ fontFamily: 'TT Firs Neue, sans-serif', minHeight: '100vh', padding: 20 }}
      >
        <p style={{ color: 'rgba(16,16,16,0.7)', marginBottom: 16, textAlign: 'center' }}>
          Сначала выберите тариф на странице провайдеров.
        </p>
        <Button onClick={() => router.push('/providers')}>К тарифам</Button>
      </div>
    );
  }

  return (
    <div
      className="relative w-full max-w-[400px] mx-auto bg-[#F5F5F5] overflow-hidden"
      style={{
        fontFamily: 'TT Firs Neue, sans-serif',
        minHeight: '100vh',
        maxHeight: '870px',
      }}
    >
      {/* Header */}
      <div
        className="absolute flex items-center"
        style={{ width: '360px', left: '20px', top: '24px' }}
      >
        <button
          type="button"
          onClick={() => router.push('/')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white cursor-pointer"
          aria-label="На главную"
        >
          <HomeIcon color="#101010" />
        </button>
        <span
          style={{
            marginLeft: 12,
            fontSize: 20,
            fontWeight: 400,
            color: '#101010',
          }}
        >
          Оформление заявки
        </span>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 px-5 pt-24 pb-8"
        style={{ paddingTop: 100 }}
      >
        <div>
          <label className="block mb-1 text-sm text-[rgba(16,16,16,0.6)]">ФИО *</label>
          <Input
            value={fullName}
            onChange={setFullName}
            placeholder="Иванов Иван Иванович"
            type="text"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm text-[rgba(16,16,16,0.6)]">Телефон *</label>
          <Input
            value={phone}
            onChange={setPhone}
            placeholder="+7 (999) 123-45-67"
            type="tel"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm text-[rgba(16,16,16,0.6)]">Email</label>
          <Input
            value={email}
            onChange={setEmail}
            placeholder="example@mail.ru"
            type="email"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm text-[rgba(16,16,16,0.6)]">Адрес подключения</label>
          <Input
            value={address}
            onChange={setAddress}
            placeholder="Город, улица, дом, квартира"
            type="text"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm text-[rgba(16,16,16,0.6)]">Комментарий</label>
          <Input
            value={comment}
            onChange={setComment}
            placeholder="Пожелания по времени подключения"
            type="text"
          />
        </div>

        {submitError && (
          <p className="text-sm text-red-600" style={{ marginTop: -8 }}>
            {submitError}
          </p>
        )}

        <div className="mt-2 flex flex-col gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.push('/equipment')}>
            Назад к оборудованию
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function Frame5() {
  return (
    <AddressProvider>
      <Frame5Content />
    </AddressProvider>
  );
}
