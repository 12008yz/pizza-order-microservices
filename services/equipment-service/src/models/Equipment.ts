import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface EquipmentAttributes {
  id: number;
  name: string;                    // "Роутер Wi-Fi 6"
  description: string;              // Описание оборудования
  providerId: number;              // FK на Provider (связь с провайдером)
  equipmentTypeId: number;         // FK на EquipmentType
  
  // Цены
  purchasePrice: number | null;   // Цена покупки (null = не продается)
  installmentMonths: number | null; // Рассрочка на N месяцев (null = рассрочка недоступна)
  rentalMonthlyPrice: number | null; // Ежемесячная арендная плата (null = аренда недоступна)
  setupPrice: number;              // Стоимость установки/настройки
  
  // Мета
  isActive: boolean;
  imageUrl: string | null;         // URL изображения оборудования
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EquipmentCreationAttributes
  extends Optional<EquipmentAttributes, 'id' | 'purchasePrice' | 'installmentMonths' | 'rentalMonthlyPrice' | 'setupPrice' | 'isActive' | 'imageUrl'> {}

export class Equipment
  extends Model<EquipmentAttributes, EquipmentCreationAttributes>
  implements EquipmentAttributes
{
  public id!: number;
  public name!: string;
  public description!: string;
  public providerId!: number;
  public equipmentTypeId!: number;
  public purchasePrice!: number | null;
  public installmentMonths!: number | null;
  public rentalMonthlyPrice!: number | null;
  public setupPrice!: number;
  public isActive!: boolean;
  public imageUrl!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Equipment.init(
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
      comment: 'ID провайдера (связь через внешний API)',
    },
    equipmentTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'equipment_types',
        key: 'id',
      },
    },
    purchasePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Цена покупки (null = не продается)',
    },
    installmentMonths: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Рассрочка на N месяцев (null = рассрочка недоступна)',
    },
    rentalMonthlyPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Ежемесячная арендная плата (null = аренда недоступна)',
    },
    setupPrice: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: false,
      comment: 'Стоимость установки/настройки',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'equipment',
    timestamps: true,
  }
);
