import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { sequelize } from './config/database';
import { logger } from './utils/logger';
import authRoutes from './routes/auth.routes';
import { errorHandler } from './middleware/errorHandler';

// Инициализация моделей и ассоциаций
import './models/index';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// В продакшене строго проверяем наличие критичных секретов
if (process.env.NODE_ENV === 'production') {
  const missing: string[] = [];
  if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');
  if (!process.env.JWT_REFRESH_SECRET) missing.push('JWT_REFRESH_SECRET');

  if (missing.length > 0) {
    logger.error('Critical security environment variables are missing in production', {
      missing,
    });
    // Немедленно останавливаем сервис, чтобы не запускаться с небезопасной конфигурацией
    throw new Error(
      `Missing required security env vars in production: ${missing.join(', ')}`
    );
  }
}

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'auth-service' });
});

// Error handling
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');

    await sequelize.sync({ alter: false });
    logger.info('Database models synchronized.');

    app.listen(PORT, () => {
      logger.info(`Auth Service running on port ${PORT}`);
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




