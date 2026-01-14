import { Region } from './Region';
import { City } from './City';
import { StreetType } from './StreetType';
import { Street } from './Street';
import { Building } from './Building';
import { Apartment } from './Apartment';

// Определяем ассоциации
// Region -> City (один ко многим)
City.belongsTo(Region, { foreignKey: 'regionId', as: 'region' });
Region.hasMany(City, { foreignKey: 'regionId', as: 'cities' });

// City -> Street (один ко многим)
Street.belongsTo(City, { foreignKey: 'cityId', as: 'city' });
City.hasMany(Street, { foreignKey: 'cityId', as: 'streets' });

// StreetType -> Street (один ко многим)
Street.belongsTo(StreetType, { foreignKey: 'streetTypeId', as: 'streetType' });
StreetType.hasMany(Street, { foreignKey: 'streetTypeId', as: 'streets' });

// Street -> Building (один ко многим)
Building.belongsTo(Street, { foreignKey: 'streetId', as: 'street' });
Street.hasMany(Building, { foreignKey: 'streetId', as: 'buildings' });

// Building -> Apartment (один ко многим)
Apartment.belongsTo(Building, { foreignKey: 'buildingId', as: 'building' });
Building.hasMany(Apartment, { foreignKey: 'buildingId', as: 'apartments' });

export { Region, City, StreetType, Street, Building, Apartment };
