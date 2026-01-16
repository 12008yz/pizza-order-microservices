'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Делаем старые строковые поля адреса nullable, так как теперь используется ID-подход
    await queryInterface.changeColumn('applications', 'city', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('applications', 'street', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('applications', 'house', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Откат - возвращаем NOT NULL (но только если нет NULL значений)
    await queryInterface.sequelize.query(`
      UPDATE applications 
      SET city = COALESCE(city, '') 
      WHERE city IS NULL;
    `);

    await queryInterface.sequelize.query(`
      UPDATE applications 
      SET street = COALESCE(street, '') 
      WHERE street IS NULL;
    `);

    await queryInterface.sequelize.query(`
      UPDATE applications 
      SET house = COALESCE(house, '') 
      WHERE house IS NULL;
    `);

    await queryInterface.changeColumn('applications', 'city', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('applications', 'street', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('applications', 'house', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
