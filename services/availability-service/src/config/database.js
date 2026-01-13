require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'availability_user',
    password: process.env.DB_PASSWORD || 'availability_password',
    database: process.env.DB_NAME || 'availability_db',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5437'),
    dialect: 'postgres',
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5437'),
    dialect: 'postgres',
  },
};
