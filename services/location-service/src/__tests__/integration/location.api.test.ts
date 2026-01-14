import request from 'supertest';
import express from 'express';
import locationRoutes from '../../routes/location.routes';
import { errorHandler } from '../../middleware/errorHandler';

// Создаем тестовое приложение
const app = express();
app.use(express.json());
app.use('/api/locations', locationRoutes);
app.use(errorHandler);

describe('Location API Integration Tests', () => {
  describe('GET /api/locations/regions', () => {
    it('should return list of regions', async () => {
      const response = await request(app)
        .get('/api/locations/regions')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/locations/cities', () => {
    it('should return 400 if region_id is missing', async () => {
      const response = await request(app)
        .get('/api/locations/cities')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return cities for a region', async () => {
      const response = await request(app)
        .get('/api/locations/cities?region_id=1')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('GET /api/locations/street-types', () => {
    it('should return list of street types', async () => {
      const response = await request(app)
        .get('/api/locations/street-types')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('GET /api/locations/search', () => {
    it('should return 400 if query is missing', async () => {
      const response = await request(app)
        .get('/api/locations/search')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should search addresses', async () => {
      const response = await request(app)
        .get('/api/locations/search?q=Москва')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });
  });
});
