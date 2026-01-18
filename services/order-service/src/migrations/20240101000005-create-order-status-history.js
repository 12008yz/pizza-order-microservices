'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('order_status_history', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID заявки',
      },
      status: {
        type: Sequelize.ENUM('new', 'processing', 'contacted', 'scheduled', 'connected', 'cancelled', 'rejected'),
        allowNull: false,
      },
      changedBy: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Кто изменил статус (userId или system)',
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Комментарий к изменению статуса',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('order_status_history', ['orderId']);
    await queryInterface.addIndex('order_status_history', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('order_status_history');
  },
};
