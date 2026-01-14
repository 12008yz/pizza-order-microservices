import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface UserSessionAttributes {
  id: number;
  userId: number;
  token: string;                    // Токен сессии
  ipAddress: string | null;         // IP адрес
  userAgent: string | null;         // User Agent
  expiresAt: Date;                   // Время истечения
  isActive: boolean;                // Активна ли сессия
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserSessionCreationAttributes
  extends Optional<UserSessionAttributes, 'id' | 'ipAddress' | 'userAgent' | 'isActive'> {}

export class UserSession
  extends Model<UserSessionAttributes, UserSessionCreationAttributes>
  implements UserSessionAttributes
{
  public id!: number;
  public userId!: number;
  public token!: string;
  public ipAddress!: string | null;
  public userAgent!: string | null;
  public expiresAt!: Date;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserSession.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'user_sessions',
    timestamps: true,
  }
);
