import { DataTypes, Model, Optional, BelongsToGetAssociationMixin } from 'sequelize';
import { sequelize } from '../config/database';
import { Street } from './Street';

export interface BuildingAttributes {
  id: number;
  number: string; // Номер дома (может быть "1", "1А", "1-3" и т.д.)
  building?: string | null; // Корпус/строение (например, "к.1", "стр.2")
  streetId: number;
  latitude?: number | null;
  longitude?: number | null;
  postalCode?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BuildingCreationAttributes
  extends Optional<BuildingAttributes, 'id' | 'building' | 'latitude' | 'longitude' | 'postalCode' | 'createdAt' | 'updatedAt'> {}

export class Building
  extends Model<BuildingAttributes, BuildingCreationAttributes>
  implements BuildingAttributes
{
  public id!: number;
  public number!: string;
  public building!: string | null;
  public streetId!: number;
  public latitude!: number | null;
  public longitude!: number | null;
  public postalCode!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public getStreet!: BelongsToGetAssociationMixin<Street>;
}

Building.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Номер дома',
    },
    building: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Корпус/строение',
    },
    streetId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'streets',
        key: 'id',
      },
      comment: 'ID улицы',
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
      comment: 'Широта',
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
      comment: 'Долгота',
    },
    postalCode: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: 'Почтовый индекс',
    },
  },
  {
    sequelize,
    tableName: 'buildings',
    timestamps: true,
  }
);

// Association
Building.belongsTo(Street, { foreignKey: 'streetId', as: 'street' });
