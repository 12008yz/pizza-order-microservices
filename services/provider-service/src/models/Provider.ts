import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface ProviderAttributes {
  id: number;
  name: string;                    // "Ростелеком"
  slug: string;                    // "rostelecom"
  logo: string;                    // URL логотипа
  description: string;             // Описание компании
  website: string;                 // Официальный сайт
  phone: string;                   // Телефон поддержки

  // Рейтинг
  rating: number;                  // Средний рейтинг (1-5)
  reviewsCount: number;            // Количество отзывов

  // Мета
  foundedYear: number | null;      // Год основания
  isActive: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProviderCreationAttributes
  extends Optional<ProviderAttributes, 'id' | 'rating' | 'reviewsCount' | 'isActive' | 'foundedYear'> {}

export class Provider
  extends Model<ProviderAttributes, ProviderCreationAttributes>
  implements ProviderAttributes
{
  public id!: number;
  public name!: string;
  public slug!: string;
  public logo!: string;
  public description!: string;
  public website!: string;
  public phone!: string;
  public rating!: number;
  public reviewsCount!: number;
  public foundedYear!: number | null;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Provider.init(
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
    logo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
      allowNull: false,
    },
    reviewsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    foundedYear: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'providers',
    timestamps: true,
  }
);


