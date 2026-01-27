'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('tariffs', 'promoText', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Текст промо-акции (например: "90 дней за 0 р.")',
    });

    await queryInterface.addColumn('tariffs', 'favoriteLabel', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Название дополнительного сервиса (например: "Кинотеатр «Wink»")',
    });

    await queryInterface.addColumn('tariffs', 'favoriteDesc', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Описание дополнительного сервиса (например: "Дополнительное приложение")',
    });

    await queryInterface.addColumn('tariffs', 'popularity', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Популярность тарифа для сортировки',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('tariffs', 'promoText');
    await queryInterface.removeColumn('tariffs', 'favoriteLabel');
    await queryInterface.removeColumn('tariffs', 'favoriteDesc');
    await queryInterface.removeColumn('tariffs', 'popularity');
  },
};
