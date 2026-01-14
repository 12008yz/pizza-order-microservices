import { EquipmentType } from './EquipmentType';
import { Equipment } from './Equipment';

// Определяем ассоциации
Equipment.belongsTo(EquipmentType, { foreignKey: 'equipmentTypeId', as: 'equipmentType' });
EquipmentType.hasMany(Equipment, { foreignKey: 'equipmentTypeId', as: 'equipment' });

export { EquipmentType, Equipment };
