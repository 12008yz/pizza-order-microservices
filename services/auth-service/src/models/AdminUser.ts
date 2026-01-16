import { DataTypes, Model, Optional, ModelStatic } from 'sequelize';
import { sequelize } from '../config/database';

export interface AdminUserAttributes {
  id: number;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'operator';
  department?: string | null; // Для операторов: компания/категория
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AdminUserCreationAttributes
  extends Optional<AdminUserAttributes, 'id' | 'department' | 'isActive'> {}

export class AdminUser
  extends Model<AdminUserAttributes, AdminUserCreationAttributes>
  implements AdminUserAttributes
{
  declare id: number;
  declare email: string;
  declare password: string;
  declare name: string;
  declare role: 'admin' | 'operator';
  declare department: string | null;
  declare isActive: boolean;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export type AdminUserModel = ModelStatic<AdminUser>;

AdminUser.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'operator'),
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Для операторов: компания/категория',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'admin_users',
    timestamps: true,
  }
);
