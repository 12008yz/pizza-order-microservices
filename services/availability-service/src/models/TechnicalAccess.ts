import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface TechnicalAccessAttributes {
  id: number;
  buildingId: number | null;        // ID дома из Location Service
  apartmentId: number | null;       // ID квартиры из Location Service
  providerId: number;               // ID провайдера
  connectionType: string;           // Тип подключения: 'fiber', 'cable', 'dsl', 'wireless'
  isAvailable: boolean;             // Доступно ли подключение
  notes: string | null;             // Дополнительные заметки
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TechnicalAccessCreationAttributes
  extends Optional<TechnicalAccessAttributes, 'id' | 'buildingId' | 'apartmentId' | 'notes' | 'createdAt' | 'updatedAt'> {}

export class TechnicalAccess
  extends Model<TechnicalAccessAttributes, TechnicalAccessCreationAttributes>
  implements TechnicalAccessAttributes
{
  public id!: number;
  public buildingId!: number | null;
  public apartmentId!: number | null;
  public providerId!: number;
  public connectionType!: string;
  public isAvailable!: boolean;
  public notes!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TechnicalAccess.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    buildingId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID дома из Location Service',
    },
    apartmentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID квартиры из Location Service',
    },
    providerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID провайдера',
    },
    connectionType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'fiber',
      comment: 'Тип подключения: fiber, cable, dsl, wireless',
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'technical_access',
    timestamps: true,
  }
);
