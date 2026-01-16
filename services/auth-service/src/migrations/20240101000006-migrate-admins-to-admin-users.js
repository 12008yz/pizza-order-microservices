'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Переносим существующих админов из users в admin_users
    // Только те, у которых есть email и password (это админы/операторы)
    await queryInterface.sequelize.query(`
      INSERT INTO admin_users (email, password, name, role, "isActive", "createdAt", "updatedAt")
      SELECT 
        email, 
        password, 
        COALESCE(name, 'Admin') as name,
        'admin' as role,
        true as "isActive",
        "createdAt",
        "updatedAt"
      FROM users
      WHERE role::text = 'admin' 
        AND email IS NOT NULL 
        AND password IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM admin_users WHERE admin_users.email = users.email
        )
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Откат миграции - удаляем перенесенных админов из admin_users
    // ВНИМАНИЕ: Это удалит всех админов из admin_users!
    // Обычно откат миграции данных не рекомендуется
    await queryInterface.sequelize.query(`
      DELETE FROM admin_users
      WHERE email IN (
        SELECT email FROM users WHERE role = 'admin'
      )
    `);
  },
};
