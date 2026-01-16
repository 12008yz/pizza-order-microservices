import { DataTypes, Model, Optional, ModelStatic } from 'sequelize';
import { sequelize } from '../config/database';

export interface UserAttributes {
  id: number;
  email: string | null;
  password: string | null;
  name: string | null;
  phone: string | null;
  fullName: string | null;
  role: 'user' | 'admin';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'role'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: number;
  declare email: string | null;
  declare password: string | null;
  declare name: string | null;
  declare phone: string | null;
  declare fullName: string | null;
  declare role: 'user' | 'admin';

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export type UserModel = ModelStatic<User>;

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      defaultValue: 'user',
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
  }
);

