'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Делаем email и password опциональными
    await queryInterface.changeColumn('users', 'email', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });

    await queryInterface.changeColumn('users', 'password', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('users', 'name', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Добавляем поля phone и fullName
    await queryInterface.addColumn('users', 'phone', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });

    await queryInterface.addColumn('users', 'fullName', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Удаляем добавленные поля
    await queryInterface.removeColumn('users', 'phone');
    await queryInterface.removeColumn('users', 'fullName');

    // Возвращаем обратно обязательные поля (но это может вызвать проблемы, если есть записи с null)
    await queryInterface.changeColumn('users', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });

    await queryInterface.changeColumn('users', 'password', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('users', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
