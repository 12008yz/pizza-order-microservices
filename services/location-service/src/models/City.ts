import { DataTypes, Model, Optional, BelongsToGetAssociationMixin, BelongsToCreateAssociationMixin } from 'sequelize';
import { sequelize } from '../config/database';
import { Region } from './Region';

export interface CityAttributes {
  id: number;
  name: string;
  nameEn?: string | null;
  regionId: number;
  latitude?: number | null;
  longitude?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CityWithRegion extends CityAttributes {
  region?: Region;
}

export interface CityCreationAttributes
  extends Optional<CityAttributes, 'id' | 'nameEn' | 'latitude' | 'longitude' | 'createdAt' | 'updatedAt'> {}

export class City
  extends Model<CityAttributes, CityCreationAttributes>
  implements CityAttributes
{
  public id!: number;
  public name!: string;
  public nameEn!: string | null;
  public regionId!: number;
  public latitude!: number | null;
  public longitude!: number | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public getRegion!: BelongsToGetAssociationMixin<Region>;
  public createRegion!: BelongsToCreateAssociationMixin<Region>;
  
  // Non-typed associations (for include)
  public region?: Region;
}

City.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Название города',
    },
    nameEn: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Название города на английском',
    },
    regionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'regions',
        key: 'id',
      },
      comment: 'ID региона',
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
    tableName: 'cities',
    timestamps: true,
  }
);

// Association is defined in models/index.ts
