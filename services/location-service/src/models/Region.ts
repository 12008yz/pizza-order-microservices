import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface RegionAttributes {
  id: number;
  name: string;
  nameEn?: string | null;
  code?: string | null; // Код региона (например, "77" для Москвы)
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RegionCreationAttributes
  extends Optional<RegionAttributes, 'id' | 'nameEn' | 'code' | 'createdAt' | 'updatedAt'> {}

export class Region
  extends Model<RegionAttributes, RegionCreationAttributes>
  implements RegionAttributes
{
  public id!: number;
  public name!: string;
  public nameEn!: string | null;
  public code!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Region.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Название региона',
    },
    nameEn: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Название региона на английском',
    },
    code: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: 'Код региона',
    },
  },
  {
    sequelize,
    tableName: 'regions',
    timestamps: true,
  }
);
