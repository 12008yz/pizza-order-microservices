import { DataTypes, Model, Optional, BelongsToGetAssociationMixin } from 'sequelize';
import { sequelize } from '../config/database';
import { Building } from './Building';

export interface ApartmentAttributes {
  id: number;
  number: string; // Номер квартиры (может быть "1", "1А", "1-10" и т.д.)
  buildingId: number;
  entrance?: number | null; // Номер подъезда
  floor?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApartmentCreationAttributes
  extends Optional<ApartmentAttributes, 'id' | 'entrance' | 'floor' | 'createdAt' | 'updatedAt'> {}

export class Apartment
  extends Model<ApartmentAttributes, ApartmentCreationAttributes>
  implements ApartmentAttributes
{
  public id!: number;
  public number!: string;
  public buildingId!: number;
  public entrance!: number | null;
  public floor!: number | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public getBuilding!: BelongsToGetAssociationMixin<Building>;
}

Apartment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Номер квартиры',
    },
    buildingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'buildings',
        key: 'id',
      },
      comment: 'ID дома',
    },
    entrance: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Номер подъезда',
    },
    floor: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Этаж',
    },
  },
  {
    sequelize,
    tableName: 'apartments',
    timestamps: true,
  }
);

// Association is defined in models/index.ts
