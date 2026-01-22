import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME || 'locations_db',
  process.env.DB_USER || 'locations_user',
  process.env.DB_PASSWORD || 'locations_password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    // Гарантируем правильное цитирование идентификаторов в SQL запросах
    // PostgreSQL без кавычек преобразует имена в нижний регистр (shortName -> shortname)
    // С кавычками сохраняется точное имя колонки
    quoteIdentifiers: true,
    define: {
      // Отключаем автоматическое преобразование camelCase в snake_case
      // Это важно, так как в БД колонки созданы в camelCase (shortName, streetTypeId и т.д.)
      underscored: false,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);
