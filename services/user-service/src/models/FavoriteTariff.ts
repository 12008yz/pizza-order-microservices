import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface FavoriteTariffAttributes {
  id: number;
  userId: number | null;            // Для авторизованных пользователей
  phone: string | null;             // Для неавторизованных (идентификация по телефону)
  tariffId: number;                 // ID тарифа (связь через внешний API Provider Service)
  providerId: number;               // ID провайдера (связь через внешний API Provider Service)
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FavoriteTariffCreationAttributes
  extends Optional<FavoriteTariffAttributes, 'id' | 'userId' | 'phone'> {}

export class FavoriteTariff
  extends Model<FavoriteTariffAttributes, FavoriteTariffCreationAttributes>
  implements FavoriteTariffAttributes
{
  public id!: number;
  public userId!: number | null;
  public phone!: string | null;
  public tariffId!: number;
  public providerId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

FavoriteTariff.init(
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
    tariffId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID тарифа (связь через внешний API Provider Service)',
    },
    providerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID провайдера (связь через внешний API Provider Service)',
    },
  },
  {
    sequelize,
    tableName: 'favorite_tariffs',
    timestamps: true,
  }
);
