import { Order } from './Order';
import { OrderItem } from './OrderItem';
import { OrderStatusHistory } from './OrderStatusHistory';

// Ассоциации
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

Order.hasMany(OrderStatusHistory, { foreignKey: 'orderId', as: 'statusHistory' });
OrderStatusHistory.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

export { Order, OrderItem, OrderStatusHistory };
