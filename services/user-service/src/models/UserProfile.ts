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



