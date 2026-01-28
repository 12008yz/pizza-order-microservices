import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface UserSensitiveDataAttributes {
  id: number;
  phone: string; // Нормализованный номер телефона (основной идентификатор)
  passportDataEnc?: string | null; // Зашифрованные паспортные данные (серия, номер, дата выдачи и т.п.)
  snilsEnc?: string | null; // Зашифрованный СНИЛС
  innEnc?: string | null; // Зашифрованный ИНН
  extraEnc?: string | null; // Любые дополнительные чувствительные данные (JSON, но в зашифрованном виде)
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserSensitiveDataCreationAttributes
  extends Optional<
    UserSensitiveDataAttributes,
    'id' | 'passportDataEnc' | 'snilsEnc' | 'innEnc' | 'extraEnc'
  > {}

export class UserSensitiveData
  extends Model<UserSensitiveDataAttributes, UserSensitiveDataCreationAttributes>
  implements UserSensitiveDataAttributes
{
  public id!: number;
  public phone!: string;
  public passportDataEnc?: string | null;
  public snilsEnc?: string | null;
  public innEnc?: string | null;
  public extraEnc?: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserSensitiveData.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'Нормализованный телефон пользователя, основной идентификатор записи',
    },
    passportDataEnc: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Зашифрованные паспортные данные (AES-256-GCM, application-level encryption)',
    },
    snilsEnc: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Зашифрованный СНИЛС',
    },
    innEnc: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Зашифрованный ИНН',
    },
    extraEnc: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Зашифрованные дополнительные данные в произвольном формате (обычно JSON)',
    },
  },
  {
    sequelize,
    tableName: 'user_sensitive_data',
    timestamps: true,
  }
);

