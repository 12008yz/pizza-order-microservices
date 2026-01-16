import { DataTypes, Model, Optional, ModelStatic } from 'sequelize';
import { sequelize } from '../config/database';

export interface UserAttributes {
  id: number;
  email: string | null;
  password: string | null;
  name: string | null;
  phone: string | null;
  fullName: string | null;
  role: 'user'; // Только 'user' для клиентов, админы/операторы в admin_users
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
  declare role: 'user';

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
      type: DataTypes.ENUM('user'),
      defaultValue: 'user',
      comment: 'Всегда "user" для клиентов. Админы/операторы хранятся в таблице admin_users',
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
  }
);

