import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface CoverageAttributes {
  id: number;
  providerId: number;              // FK на Provider
  city: string;                    // "Москва"
  district: string | null;         // "Центральный"
  street: string | null;           // "Тверская"
  houseFrom: number | null;        // Номер дома с
  houseTo: number | null;          // Номер дома по

  createdAt?: Date;
  updatedAt?: Date;
}

export interface CoverageCreationAttributes
  extends Optional<CoverageAttributes, 'id' | 'district' | 'street' | 'houseFrom' | 'houseTo'> {}

export class Coverage
  extends Model<CoverageAttributes, CoverageCreationAttributes>
  implements CoverageAttributes
{
  public id!: number;
  public providerId!: number;
  public city!: string;
  public district!: string | null;
  public street!: string | null;
  public houseFrom!: number | null;
  public houseTo!: number | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Coverage.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    providerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'providers',
        key: 'id',
      },
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    district: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    street: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    houseFrom: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    houseTo: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'coverage',
    timestamps: true,
  }
);

