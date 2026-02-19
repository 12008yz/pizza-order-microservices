'use strict';

const bcrypt = require('bcryptjs');

const INITIAL_EMAIL = 'a12@admin.local';
const INITIAL_PASSWORD = 'A13';
const INITIAL_NAME = 'Admin';

module.exports = {
  up: async (queryInterface) => {
    const hashedPassword = await bcrypt.hash(INITIAL_PASSWORD, 10);
    const now = new Date();

    await queryInterface.sequelize.query(
      `INSERT INTO admin_users (email, password, name, role, "isActive", "createdAt", "updatedAt")
       VALUES (:email, :password, :name, 'admin', true, :now, :now)
       ON CONFLICT (email) DO NOTHING`,
      {
        replacements: {
          email: INITIAL_EMAIL,
          password: hashedPassword,
          name: INITIAL_NAME,
          now,
        },
      }
    );
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('admin_users', { email: INITIAL_EMAIL }, {});
  },
};
