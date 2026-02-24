"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { fetchOrder } from "@/lib/api";
import { formatPhone, formatDate } from "@/lib/utils";
import type { Order } from "@/types";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchOrder(id)
      .then((data) => {
        if (cancelled) return;
        setOrder(data as Order);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? "Заявка не найдена");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return <div className="py-8 text-muted-foreground">Загрузка...</div>;
  }
  if (error || !order) {
    return (
      <div className="space-y-4">
        <p className="text-error">{error ?? "Заявка не найдена"}</p>
        <Button variant="secondary" onClick={() => router.push("/orders")}>
          К списку заявок
        </Button>
      </div>
    );
  }

  const labelStyle = "font-frame leading-[125%] text-[rgba(16,16,16,0.5)]";
  const valueStyle = "font-frame font-medium leading-[125%] text-[#101010]";
  const sectionTitle = "font-frame text-[20px] leading-[125%] text-[#101010] font-normal border-b border-[rgba(16,16,16,0.1)] pb-2 mb-3";

  const col = (title: string, value: string | number | null | undefined) => (
    <div key={title} style={{ marginBottom: 15 }}>
      <p className={labelStyle} style={{ fontSize: 12, marginBottom: 5 }}>{title}</p>
      <p className={valueStyle} style={{ fontSize: 16 }}>{value ?? "—"}</p>
    </div>
  );

  return (
    <div className="space-y-4 font-frame">
      <div className="flex items-center justify-between">
        <Link href="/orders" className="text-sm text-[rgba(16,16,16,0.5)] hover:underline">
          ← К списку заявок
        </Link>
        <Badge status={order.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="space-y-3 rounded-[20px] border-[rgba(16,16,16,0.1)]">
          <h3 className={sectionTitle}>Персональные данные</h3>
          {col("Номер лицевого счёта", String(order.id))}
          {col("Номер сотового телефона", formatPhone(order.phone))}
          {col("Персона", "Подкл. квартиры")}
          {col("Имя", order.firstName)}
          {col("Фамилия", order.lastName)}
          {col("Дата рождения", formatDate(order.dateOfBirth))}
          {col("Гражданство", order.citizenship ?? "Российское")}
          {col("Технология", "FTTX · 8")}
          {col("Компания", (order as Order & { provider?: { name: string } }).provider?.name)}
          {col("Комплектация", (order as Order & { tariff?: { name: string } }).tariff?.name)}
        </Card>

        <Card className="space-y-3 rounded-[20px] border-[rgba(16,16,16,0.1)]">
          <h3 className={sectionTitle}>Адрес</h3>
          {col("Номер идентификатора", order.buildingId ? String(order.buildingId) : null)}
          {col("Адрес", order.addressString)}
          {col("Подъезд", order.entrance)}
          {col("Этаж", order.floor)}
          {col("Квартира", order.apartmentId ? String(order.apartmentId) : null)}
          {col("Плата подключения", order.totalConnectionPrice != null ? `${order.totalConnectionPrice} р.` : null)}
          {col("Плата месячная", order.totalMonthlyPrice != null ? `${order.totalMonthlyPrice} р.` : null)}
        </Card>

        <Card className="space-y-3 rounded-[20px] border-[rgba(16,16,16,0.1)]">
          <h3 className={sectionTitle}>Статусы и даты</h3>
          {col("Фаза", order.status)}
          {col("Дата появления", formatDate(order.createdAt))}
          {col("Дата назначения", formatDate(order.preferredDate))}
          {col("Дата подключения", null)}
          {col("WI-оборудование", order.routerOption)}
          {col("Роутер: потребность", order.routerNeed)}
          {col("Роутер: покупка/аренда", order.routerPurchase)}
          {col("Роутер: оператор", order.routerOperator)}
          {col("Роутер: конфиг", order.routerConfig)}
          {col("TV-оборудование", order.tvSettopOption)}
          {col("SIM-карта", order.simCardOption)}
          {col("Назначен", order.assignedTo)}
        </Card>

        <Card className="space-y-3 rounded-[20px] border-[rgba(16,16,16,0.1)]">
          <h3 className={sectionTitle}>Комментарии</h3>
          {col("Комментарий", order.comment)}
          {col("Внутренний", order.internalComment)}
        </Card>
      </div>
    </div>
  );
}
