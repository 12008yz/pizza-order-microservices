import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface TariffAttributes {
  id: number;
  name: string;                    // "Домашний интернет 100"
  description: string;             // Описание тарифа
  providerId: number;              // FK на Provider

  // Интернет
  speed: number;                   // Скорость Мбит/с
  price: number;                   // Ежемесячная плата
  connectionPrice: number;         // Стоимость подключения (0 = бесплатно)
  technology: 'fiber' | 'dsl' | 'cable' | 'wireless' | 'mobile';

  // ТВ
  hasTV: boolean;
  tvChannels: number | null;       // Количество каналов

  // Мобильная связь (пакет)
  hasMobile: boolean;
  mobileMinutes: number | null;    // Минуты
  mobileGB: number | null;         // Гигабайты
  mobileSMS: number | null;        // SMS

  // Акции
  promoPrice: number | null;       // Акционная цена
  promoMonths: number | null;      // На сколько месяцев
  promoText: string | null;        // Текст промо-акции (например: "90 дней за 0 р.")

  // Дополнительные сервисы
  favoriteLabel: string | null;    // Название дополнительного сервиса (например: "Кинотеатр «Wink»")
  favoriteDesc: string | null;    // Описание дополнительного сервиса

  // Популярность
  popularity: number;              // Популярность тарифа для сортировки

  // Статус
  isActive: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface TariffCreationAttributes
  extends Optional<TariffAttributes, 'id' | 'isActive' | 'hasTV' | 'hasMobile' | 'tvChannels' | 'mobileMinutes' | 'mobileGB' | 'mobileSMS' | 'promoPrice' | 'promoMonths' | 'connectionPrice' | 'promoText' | 'favoriteLabel' | 'favoriteDesc' | 'popularity'> { }

export class Tariff
  extends Model<TariffAttributes, TariffCreationAttributes>
  implements TariffAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
  public providerId!: number;
  public speed!: number;
  public price!: number;
  public connectionPrice!: number;
  public technology!: 'fiber' | 'dsl' | 'cable' | 'wireless' | 'mobile';
  public hasTV!: boolean;
  public tvChannels!: number | null;
  public hasMobile!: boolean;
  public mobileMinutes!: number | null;
  public mobileGB!: number | null;
  public mobileSMS!: number | null;
  public promoPrice!: number | null;
  public promoMonths!: number | null;
  public promoText!: string | null;
  public favoriteLabel!: string | null;
  public favoriteDesc!: string | null;
  public popularity!: number;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Tariff.init(
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
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    providerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'providers',
        key: 'id',
      },
    },
    speed: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    connectionPrice: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: false,
    },
    technology: {
      type: DataTypes.ENUM('fiber', 'dsl', 'cable', 'wireless', 'mobile'),
      allowNull: false,
    },
    hasTV: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    tvChannels: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    hasMobile: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    mobileMinutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    mobileGB: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    mobileSMS: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    promoPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    promoMonths: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    promoText: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    favoriteLabel: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    favoriteDesc: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    popularity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'tariffs',
    timestamps: true,
  }
);


