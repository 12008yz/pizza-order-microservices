import { sequelize } from '../config/database';

beforeAll(async () => {
  if (process.env.NODE_ENV !== 'test') {
    process.env.NODE_ENV = 'test';
  }
});

afterAll(async () => {
  await sequelize.close();
});
