import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface AvailabilityCacheAttributes {
  id: number;
  addressHash: string;              // Хеш адреса для быстрого поиска
  availableProviders: string;      // JSON строка с массивом ID провайдеров
  expiresAt: Date;                  // Время истечения кеша
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AvailabilityCacheCreationAttributes
  extends Optional<AvailabilityCacheAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class AvailabilityCache
  extends Model<AvailabilityCacheAttributes, AvailabilityCacheCreationAttributes>
  implements AvailabilityCacheAttributes
{
  public id!: number;
  public addressHash!: string;
  public availableProviders!: string;
  public expiresAt!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AvailabilityCache.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    addressHash: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'Хеш адреса для быстрого поиска',
    },
    availableProviders: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'JSON строка с массивом ID провайдеров',
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Время истечения кеша',
    },
  },
  {
    sequelize,
    tableName: 'availability_cache',
    timestamps: true,
    indexes: [
      {
        fields: ['addressHash'],
        unique: true,
      },
      {
        fields: ['expiresAt'],
      },
    ],
  }
);
