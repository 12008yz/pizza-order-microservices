import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface StreetTypeAttributes {
  id: number;
  name: string; // улица, проспект, переулок, бульвар, площадь, набережная, шоссе, тупик
  shortName: string; // ул., пр., пер., бул., пл., наб., ш., туп.
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StreetTypeCreationAttributes
  extends Optional<StreetTypeAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class StreetType
  extends Model<StreetTypeAttributes, StreetTypeCreationAttributes>
  implements StreetTypeAttributes
{
  public id!: number;
  public name!: string;
  public shortName!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

StreetType.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Полное название типа улицы (улица, проспект, переулок и т.д.)',
    },
    shortName: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: 'Сокращенное название (ул., пр., пер. и т.д.)',
    },
  },
  {
    sequelize,
    tableName: 'street_types',
    timestamps: true,
  }
);
