import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { sequelize } from './config/database';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import availabilityRoutes from './routes/availability.routes';
import './models'; // Инициализация всех моделей (TechnicalAccess, AvailabilityCache)

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3006;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/availability', availabilityRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'availability-service' });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');

    await sequelize.sync({ alter: false });
    logger.info('Database models synchronized.');

    app.listen(PORT, () => {
      logger.info(`Availability Service running on port ${PORT}`);
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
