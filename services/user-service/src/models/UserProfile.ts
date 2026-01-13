import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface UserProfileAttributes {
  id: number;
  userId: number;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  street?: string | null;
  house?: string | null;
  building?: string | null;
  apartment?: string | null;
  entrance?: string | null; // подъезд
  floor?: number | null; // этаж
  intercomCode?: string | null; // код домофона
  addressComment?: string | null; // комментарий к адресу (например, "может пользователь сам встретит", "ключи спрятаны под ковриком" и т.д.)
  currentProviderId?: number | null;
  currentTariffName?: string | null;
  savedAddresses?: any | null; // JSON
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserProfileCreationAttributes
  extends Optional<UserProfileAttributes, 'id'> {}

export class UserProfile
  extends Model<UserProfileAttributes, UserProfileCreationAttributes>
  implements UserProfileAttributes
{
  public id!: number;
  public userId!: number;
  public phone?: string;
  public address?: string;
  public city?: string;
  public postalCode?: string;
  public street?: string | null;
  public house?: string | null;
  public building?: string | null;
  public apartment?: string | null;
  public entrance?: string | null;
  public floor?: number | null;
  public intercomCode?: string | null;
  public addressComment?: string | null;
  public currentProviderId?: number | null;
  public currentTariffName?: string | null;
  public savedAddresses?: any | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserProfile.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    street: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    house: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    building: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    apartment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    entrance: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Подъезд',
    },
    floor: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Этаж',
    },
    intercomCode: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Код домофона',
    },
    addressComment: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Комментарий к адресу (например, "может пользователь сам встретит", "ключи спрятаны" и т.д.)',
    },
    currentProviderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    currentTariffName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    savedAddresses: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'user_profiles',
    timestamps: true,
  }
);



