import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface UserActivityAttributes {
  id: number;
  userId: number | null;            // Для авторизованных пользователей
  phone: string | null;             // Для неавторизованных (идентификация по телефону)
  action: string;                   // Действие (например: 'view_tariff', 'search_address', 'create_order')
  details: string | null;           // Детали действия (JSON строка)
  ipAddress: string | null;         // IP адрес
  userAgent: string | null;         // User Agent
  createdAt?: Date;
}

export interface UserActivityCreationAttributes
  extends Optional<UserActivityAttributes, 'id' | 'userId' | 'phone' | 'details' | 'ipAddress' | 'userAgent'> {}

export class UserActivity
  extends Model<UserActivityAttributes, UserActivityCreationAttributes>
  implements UserActivityAttributes
{
  public id!: number;
  public userId!: number | null;
  public phone!: string | null;
  public action!: string;
  public details!: string | null;
  public ipAddress!: string | null;
  public userAgent!: string | null;

  public readonly createdAt!: Date;
}

UserActivity.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Для авторизованных пользователей',
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Для неавторизованных (идентификация по телефону)',
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Детали действия (может быть JSON)',
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'user_activities',
    timestamps: false, // Только createdAt, без updatedAt
    indexes: [
      {
        fields: ['userId', 'createdAt'],
      },
      {
        fields: ['phone', 'createdAt'],
      },
      {
        fields: ['action'],
      },
    ],
  }
);
