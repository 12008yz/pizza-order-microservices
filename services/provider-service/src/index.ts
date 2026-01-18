import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { sequelize } from './config/database';
import { logger } from './utils/logger';
import providerRoutes from './routes/provider.routes';
import tariffRoutes from './routes/tariff.routes';
import coverageRoutes from './routes/coverage.routes';
import { errorHandler } from './middleware/errorHandler';
import './models'; // Импортируем модели для инициализации ассоциаций

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/providers', providerRoutes);
app.use('/api/tariffs', tariffRoutes);
app.use('/api/coverage', coverageRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'provider-service' });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');

    await sequelize.sync({ alter: false });
    logger.info('Database models synchronized.');

    app.listen(PORT, () => {
      logger.info(`Provider Service running on port ${PORT}`);
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



