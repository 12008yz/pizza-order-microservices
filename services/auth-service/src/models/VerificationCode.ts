import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface VerificationCodeAttributes {
  id: number;
  userId: number;
  code: string;                    // Код верификации
  type: 'email' | 'phone' | 'password_reset'; // Тип верификации
  expiresAt: Date;                 // Время истечения
  isUsed: boolean;                  // Использован ли код
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VerificationCodeCreationAttributes
  extends Optional<VerificationCodeAttributes, 'id' | 'isUsed'> {}

export class VerificationCode
  extends Model<VerificationCodeAttributes, VerificationCodeCreationAttributes>
  implements VerificationCodeAttributes
{
  public id!: number;
  public userId!: number;
  public code!: string;
  public type!: 'email' | 'phone' | 'password_reset';
  public expiresAt!: Date;
  public isUsed!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

VerificationCode.init(
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
    code: {
      type: DataTypes.STRING(6),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('email', 'phone', 'password_reset'),
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isUsed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'verification_codes',
    timestamps: true,
  }
);
