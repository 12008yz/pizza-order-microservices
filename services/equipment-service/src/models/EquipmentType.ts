import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface EquipmentTypeAttributes {
  id: number;
  name: string;                    // "Роутер", "ТВ-приставка", "SIM-карта"
  slug: string;                    // "router", "tv-set-top", "sim-card"
  description: string | null;      // Описание типа оборудования
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EquipmentTypeCreationAttributes
  extends Optional<EquipmentTypeAttributes, 'id' | 'description'> {}

export class EquipmentType
  extends Model<EquipmentTypeAttributes, EquipmentTypeCreationAttributes>
  implements EquipmentTypeAttributes
{
  public id!: number;
  public name!: string;
  public slug!: string;
  public description!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

EquipmentType.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'equipment_types',
    timestamps: true,
  }
);
