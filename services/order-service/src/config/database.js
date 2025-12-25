require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'order_user',
    password: process.env.DB_PASSWORD || 'order_password',
    database: process.env.DB_NAME || 'order_db',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
  },
};

