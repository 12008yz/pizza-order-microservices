import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { sequelize } from './config/database';
import { logger } from './utils/logger';
import userRoutes from './routes/user.routes';
import { errorHandler } from './middleware/errorHandler';
import { authenticateToken } from './middleware/auth';

// Инициализация моделей
import './models/UserProfile';
import './models/FavoriteTariff';
import './models/UserPreference';
import './models/UserActivity';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// В продакшене проверяем наличие ключа шифрования чувствительных данных
if (process.env.NODE_ENV === 'production') {
  if (!process.env.DATA_ENCRYPTION_KEY) {
    logger.error(
      'DATA_ENCRYPTION_KEY is not set in production. Sensitive data encryption cannot work securely.'
    );
    throw new Error(
      'DATA_ENCRYPTION_KEY must be set in production for secure handling of sensitive user data'
    );
  }
}

// Все маршруты требуют авторизации (только для операторов/админов)
// User Service используется только для управления профилями операторов
app.use('/api/users', userRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'user-service' });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');

    await sequelize.sync({ alter: false });
    logger.info('Database models synchronized.');

    app.listen(PORT, () => {
      logger.info(`User Service running on port ${PORT}`);
    });
  } catch (error: any) {
    logger.error('Unable to start server', {
      error: error?.message || String(error),
      stack: error?.stack,
    });
    process.exit(1);
  }
};

startServer();




