import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface OrderItemAttributes {
  id: number;
  orderId: number;
  itemType: 'tariff' | 'equipment';  // Тип элемента: тариф или оборудование
  itemId: number;                     // ID тарифа или оборудования
  name: string;                        // Название элемента
  quantity: number;                    // Количество
  unitPrice: number;                   // Цена за единицу
  totalPrice: number;                  // Общая цена
  metadata: string | null;             // Дополнительные данные (JSON)
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderItemCreationAttributes
  extends Optional<OrderItemAttributes, 'id' | 'metadata' | 'createdAt' | 'updatedAt'> {}

export class OrderItem
  extends Model<OrderItemAttributes, OrderItemCreationAttributes>
  implements OrderItemAttributes
{
  public id!: number;
  public orderId!: number;
  public itemType!: 'tariff' | 'equipment';
  public itemId!: number;
  public name!: string;
  public quantity!: number;
  public unitPrice!: number;
  public totalPrice!: number;
  public metadata!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OrderItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID заявки',
    },
    itemType: {
      type: DataTypes.ENUM('tariff', 'equipment'),
      allowNull: false,
    },
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID тарифа или оборудования',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Дополнительные данные в формате JSON',
    },
  },
  {
    sequelize,
    tableName: 'order_items',
    timestamps: true,
  }
);
