import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface OrderAttributes {
  id: number;

  // Связи
  userId: number | null;           // Null для неавторизованных
  tariffId: number;                // Выбранный тариф
  providerId: number;              // Провайдер (денормализация)

  // Статус заявки
  status: 'new' | 'processing' | 'contacted' | 'scheduled' | 'connected' | 'cancelled' | 'rejected';

  // Контактные данные
  fullName: string;                // ФИО
  phone: string;                   // Телефон (обязательно)
  email: string | null;            // Email

  // Адрес подключения
  city: string;
  street: string;
  house: string;
  building: string | null;         // Корпус/строение
  apartment: string | null;        // Квартира
  entrance: string | null;         // Подъезд
  floor: string | null;            // Этаж
  intercom: string | null;         // Домофон

  // Предпочтения
  preferredDate: Date | null;      // Желаемая дата
  preferredTimeFrom: string | null; // Время с
  preferredTimeTo: string | null;   // Время по
  comment: string | null;          // Комментарий

  // Аналитика (UTM-метки)
  source: string | null;           // Источник
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;

  // Служебное
  assignedTo: string | null;       // Менеджер
  internalComment: string | null;  // Внутренний комментарий

  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderCreationAttributes
  extends Optional<OrderAttributes, 'id' | 'userId' | 'email' | 'status' | 'building' | 'apartment' | 'entrance' | 'floor' | 'intercom' | 'preferredDate' | 'preferredTimeFrom' | 'preferredTimeTo' | 'comment' | 'source' | 'utmSource' | 'utmMedium' | 'utmCampaign' | 'utmContent' | 'utmTerm' | 'assignedTo' | 'internalComment'> {}

export class Order
  extends Model<OrderAttributes, OrderCreationAttributes>
  implements OrderAttributes
{
  public id!: number;
  public userId!: number | null;
  public tariffId!: number;
  public providerId!: number;
  public status!: 'new' | 'processing' | 'contacted' | 'scheduled' | 'connected' | 'cancelled' | 'rejected';
  public fullName!: string;
  public phone!: string;
  public email!: string | null;
  public city!: string;
  public street!: string;
  public house!: string;
  public building!: string | null;
  public apartment!: string | null;
  public entrance!: string | null;
  public floor!: string | null;
  public intercom!: string | null;
  public preferredDate!: Date | null;
  public preferredTimeFrom!: string | null;
  public preferredTimeTo!: string | null;
  public comment!: string | null;
  public source!: string | null;
  public utmSource!: string | null;
  public utmMedium!: string | null;
  public utmCampaign!: string | null;
  public utmContent!: string | null;
  public utmTerm!: string | null;
  public assignedTo!: string | null;
  public internalComment!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tariffId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    providerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('new', 'processing', 'contacted', 'scheduled', 'connected', 'cancelled', 'rejected'),
      defaultValue: 'new',
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    street: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    house: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    building: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    apartment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    entrance: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    floor: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    intercom: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    preferredDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    preferredTimeFrom: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    preferredTimeTo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    source: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    utmSource: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    utmMedium: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    utmCampaign: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    utmContent: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    utmTerm: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    assignedTo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    internalComment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'applications', // Оставляем старое имя таблицы для совместимости
    timestamps: true,
  }
);
