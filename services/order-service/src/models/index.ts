import { Order } from './Order';
import { OrderItem } from './OrderItem';

// Определяем связи
Order.hasMany(OrderItem, {
  foreignKey: 'orderId',
  as: 'items',
});

OrderItem.belongsTo(Order, {
  foreignKey: 'orderId',
  as: 'order',
});

export { Order, OrderItem };

