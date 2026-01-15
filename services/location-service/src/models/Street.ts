import { DataTypes, Model, Optional, BelongsToGetAssociationMixin, BelongsToCreateAssociationMixin } from 'sequelize';
import { sequelize } from '../config/database';
import { City } from './City';
import { StreetType } from './StreetType';

export interface StreetAttributes {
  id: number;
  name: string;
  cityId: number;
  streetTypeId: number;
  latitude?: number | null;
  longitude?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StreetWithAssociations extends StreetAttributes {
  city?: City;
  streetType?: StreetType;
}

export interface StreetCreationAttributes
  extends Optional<StreetAttributes, 'id' | 'latitude' | 'longitude' | 'createdAt' | 'updatedAt'> {}

export class Street
  extends Model<StreetAttributes, StreetCreationAttributes>
  implements StreetAttributes
{
  public id!: number;
  public name!: string;
  public cityId!: number;
  public streetTypeId!: number;
  public latitude!: number | null;
  public longitude!: number | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public getCity!: BelongsToGetAssociationMixin<City>;
  public getStreetType!: BelongsToGetAssociationMixin<StreetType>;
  public createCity!: BelongsToCreateAssociationMixin<City>;
  public createStreetType!: BelongsToCreateAssociationMixin<StreetType>;
  
  // Non-typed associations (for include)
  public city?: City;
  public streetType?: StreetType;
}

Street.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Название улицы',
    },
    cityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'cities',
        key: 'id',
      },
      comment: 'ID города',
    },
    streetTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'street_types',
        key: 'id',
      },
      comment: 'ID типа улицы',
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
  },
  {
    sequelize,
    tableName: 'streets',
    timestamps: true,
  }
);

// Associations are defined in models/index.ts
