import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface OrderStatusHistoryAttributes {
  id: number;
  orderId: number;
  status: 'new' | 'processing' | 'contacted' | 'scheduled' | 'connected' | 'cancelled' | 'rejected';
  changedBy: string | null;      // Кто изменил статус (userId или 'system')
  comment: string | null;         // Комментарий к изменению статуса
  createdAt?: Date;
}

export interface OrderStatusHistoryCreationAttributes
  extends Optional<OrderStatusHistoryAttributes, 'id' | 'changedBy' | 'comment' | 'createdAt'> {}

export class OrderStatusHistory
  extends Model<OrderStatusHistoryAttributes, OrderStatusHistoryCreationAttributes>
  implements OrderStatusHistoryAttributes
{
  public id!: number;
  public orderId!: number;
  public status!: 'new' | 'processing' | 'contacted' | 'scheduled' | 'connected' | 'cancelled' | 'rejected';
  public changedBy!: string | null;
  public comment!: string | null;

  public readonly createdAt!: Date;
}

OrderStatusHistory.init(
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
    status: {
      type: DataTypes.ENUM('new', 'processing', 'contacted', 'scheduled', 'connected', 'cancelled', 'rejected'),
      allowNull: false,
    },
    changedBy: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Кто изменил статус (userId или system)',
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Комментарий к изменению статуса',
    },
  },
  {
    sequelize,
    tableName: 'order_status_history',
    timestamps: true,
    updatedAt: false, // История не обновляется, только создается
  }
);
