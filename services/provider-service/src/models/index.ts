import { Provider } from './Provider';
import { Tariff } from './Tariff';
import { Coverage } from './Coverage';

// Определяем ассоциации
Tariff.belongsTo(Provider, { foreignKey: 'providerId', as: 'provider' });
Provider.hasMany(Tariff, { foreignKey: 'providerId', as: 'tariffs' });

Coverage.belongsTo(Provider, { foreignKey: 'providerId', as: 'provider' });
Provider.hasMany(Coverage, { foreignKey: 'providerId', as: 'coverage' });

export { Provider, Tariff, Coverage };

