require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'application_user',
    password: process.env.DB_PASSWORD || 'application_password',
    database: process.env.DB_NAME || 'application_db',
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



