import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface NotificationAttributes {
  id: number;
  userId: number | null;           // ID пользователя (может быть null для системных уведомлений)
  orderId: number | null;          // ID заявки (если уведомление связано с заявкой)
  type: string;                     // Тип уведомления: 'order_created', 'status_changed', 'order_confirmed'
  title: string;                    // Заголовок уведомления
  message: string;                  // Текст уведомления
  email: string | null;             // Email для отправки
  phone: string | null;             // Телефон для SMS (если нужно)
  sent: boolean;                    // Отправлено ли уведомление
  sentAt: Date | null;              // Когда отправлено
  read: boolean;                    // Прочитано ли уведомление (для in-app)
  readAt: Date | null;              // Когда прочитано
  metadata: string | null;          // Дополнительные данные (JSON)
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NotificationCreationAttributes
  extends Optional<NotificationAttributes, 'id' | 'userId' | 'orderId' | 'email' | 'phone' | 'sent' | 'sentAt' | 'read' | 'readAt' | 'metadata' | 'createdAt' | 'updatedAt'> {}

export class Notification
  extends Model<NotificationAttributes, NotificationCreationAttributes>
  implements NotificationAttributes
{
  public id!: number;
  public userId!: number | null;
  public orderId!: number | null;
  public type!: string;
  public title!: string;
  public message!: string;
  public email!: string | null;
  public phone!: string | null;
  public sent!: boolean;
  public sentAt!: Date | null;
  public read!: boolean;
  public readAt!: Date | null;
  public metadata!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Notification.init(
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
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Дополнительные данные в формате JSON',
    },
  },
  {
    sequelize,
    tableName: 'notifications',
    timestamps: true,
  }
);
