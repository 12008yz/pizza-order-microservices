import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface UserPreferenceAttributes {
  id: number;
  userId: number | null;            // Для авторизованных пользователей
  phone: string | null;             // Для неавторизованных (идентификация по телефону)
  key: string;                      // Ключ настройки
  value: string | null;             // Значение настройки (JSON строка)
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserPreferenceCreationAttributes
  extends Optional<UserPreferenceAttributes, 'id' | 'userId' | 'phone' | 'value'> {}

export class UserPreference
  extends Model<UserPreferenceAttributes, UserPreferenceCreationAttributes>
  implements UserPreferenceAttributes
{
  public id!: number;
  public userId!: number | null;
  public phone!: string | null;
  public key!: string;
  public value!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserPreference.init(
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
    key: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Значение настройки (может быть JSON)',
    },
  },
  {
    sequelize,
    tableName: 'user_preferences',
    timestamps: true,
  }
);
