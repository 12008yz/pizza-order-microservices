import request from 'supertest';
import express from 'express';
import { errorHandler } from '../../middleware/errorHandler';

// Мокируем сервисы перед импортом роутов
const mockGetAllProviders = jest.fn();
const mockGetProviderById = jest.fn();
const mockCreateProvider = jest.fn();
const mockUpdateProvider = jest.fn();
const mockGetAllTariffs = jest.fn();
const mockGetTariffById = jest.fn();
const mockGetTariffsByAddress = jest.fn();
const mockCreateTariff = jest.fn();
const mockUpdateTariff = jest.fn();
const mockDeleteTariff = jest.fn();
const mockGetProvidersByAddress = jest.fn();

jest.mock('../../services/provider.service', () => {
  return {
    ProviderService: jest.fn().mockImplementation(() => ({
      getAllProviders: mockGetAllProviders,
      getProviderById: mockGetProviderById,
      createProvider: mockCreateProvider,
      updateProvider: mockUpdateProvider,
    })),
  };
});

jest.mock('../../services/tariff.service', () => {
  return {
    TariffService: jest.fn().mockImplementation(() => ({
      getAllTariffs: mockGetAllTariffs,
      getTariffById: mockGetTariffById,
      getTariffsByAddress: mockGetTariffsByAddress,
      createTariff: mockCreateTariff,
      updateTariff: mockUpdateTariff,
      deleteTariff: mockDeleteTariff,
    })),
  };
});

jest.mock('../../services/coverage.service', () => {
  return {
    CoverageService: jest.fn().mockImplementation(() => ({
      getProvidersByAddress: mockGetProvidersByAddress,
    })),
  };
});

// Импортируем роуты после мокирования
import providerRoutes from '../../routes/provider.routes';
import tariffRoutes from '../../routes/tariff.routes';

describe('Provider API Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/providers', providerRoutes);
    app.use('/api/tariffs', tariffRoutes);
    app.use(errorHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/providers', () => {
    it('should return all active providers', async () => {
      const mockProviders = [
        { id: 1, name: 'Provider 1', isActive: true },
        { id: 2, name: 'Provider 2', isActive: true },
      ];

      mockGetAllProviders.mockResolvedValue(mockProviders);

      const response = await request(app)
        .get('/api/providers')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(mockGetAllProviders).toHaveBeenCalledWith(true);
    });

    it('should return all providers including inactive when active=false', async () => {
      const mockProviders = [
        { id: 1, name: 'Provider 1', isActive: true },
        { id: 2, name: 'Provider 2', isActive: false },
      ];

      mockGetAllProviders.mockResolvedValue(mockProviders);

      const response = await request(app)
        .get('/api/providers?active=false')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockGetAllProviders).toHaveBeenCalledWith(false);
    });
  });

  describe('GET /api/providers/:id', () => {
    it('should return provider by id', async () => {
      const mockProvider = {
        id: 1,
        name: 'Provider 1',
        slug: 'provider-1',
        isActive: true,
      };

      mockGetProviderById.mockResolvedValue(mockProvider);

      const response = await request(app)
        .get('/api/providers/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
      expect(response.body.data.name).toBe('Provider 1');
    });

    it('should return 404 when provider not found', async () => {
      const error = new Error('Provider not found') as any;
      error.statusCode = 404;

      mockGetProviderById.mockRejectedValue(error);

      const response = await request(app)
        .get('/api/providers/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('GET /api/providers/:id/tariffs', () => {
    it('should return tariffs for provider', async () => {
      const mockTariffs = [
        { id: 1, name: 'Tariff 1', providerId: 1 },
        { id: 2, name: 'Tariff 2', providerId: 1 },
      ];

      mockGetAllTariffs.mockResolvedValue(mockTariffs);

      const response = await request(app)
        .get('/api/providers/1/tariffs')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(mockGetAllTariffs).toHaveBeenCalledWith({ providerId: 1 });
    });
  });

  describe('POST /api/providers', () => {
    it('should create new provider', async () => {
      const providerData = {
        name: 'New Provider',
        slug: 'new-provider',
        logo: 'logo.png',
        description: 'Description',
        website: 'https://example.com',
        phone: '+79991234567',
      };

      const createdProvider = {
        id: 3,
        ...providerData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreateProvider.mockResolvedValue(createdProvider);

      const response = await request(app)
        .post('/api/providers')
        .send(providerData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(providerData.name);
      expect(mockCreateProvider).toHaveBeenCalledWith(providerData);
    });
  });

  describe('PUT /api/providers/:id', () => {
    it('should update provider', async () => {
      const updateData = {
        name: 'Updated Provider',
        description: 'Updated description',
      };

      const updatedProvider = {
        id: 1,
        ...updateData,
        updatedAt: new Date(),
      };

      mockUpdateProvider.mockResolvedValue(updatedProvider);

      const response = await request(app)
        .put('/api/providers/1')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(mockUpdateProvider).toHaveBeenCalledWith(1, updateData);
    });
  });

  describe('GET /api/tariffs', () => {
    it('should return all tariffs', async () => {
      const mockTariffs = [
        { id: 1, name: 'Tariff 1', price: 500 },
        { id: 2, name: 'Tariff 2', price: 700 },
      ];

      mockGetAllTariffs.mockResolvedValue(mockTariffs);

      const response = await request(app)
        .get('/api/tariffs')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter tariffs by serviceType', async () => {
      const mockTariffs = [
        { id: 1, name: 'Internet Tariff', serviceType: 'internet' },
      ];

      mockGetAllTariffs.mockResolvedValue(mockTariffs);

      const response = await request(app)
        .get('/api/tariffs?serviceType=internet')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockGetAllTariffs).toHaveBeenCalledWith(
        expect.objectContaining({ serviceType: 'internet' })
      );
    });

    it('should sort tariffs by price', async () => {
      const mockTariffs = [
        { id: 1, name: 'Tariff 1', price: 500 },
        { id: 2, name: 'Tariff 2', price: 700 },
      ];

      mockGetAllTariffs.mockResolvedValue(mockTariffs);

      const response = await request(app)
        .get('/api/tariffs?sortBy=price&sortOrder=asc')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockGetAllTariffs).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: 'price',
          sortOrder: 'asc',
        })
      );
    });
  });

  describe('GET /api/tariffs/:id', () => {
    it('should return tariff by id', async () => {
      const mockTariff = {
        id: 1,
        name: 'Tariff 1',
        price: 500,
        providerId: 1,
      };

      mockGetTariffById.mockResolvedValue(mockTariff);

      const response = await request(app)
        .get('/api/tariffs/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
    });
  });

  describe('POST /api/tariffs', () => {
    it('should create new tariff', async () => {
      const tariffData = {
        name: 'New Tariff',
        providerId: 1,
        price: 500,
        speed: 100,
      };

      const createdTariff = {
        id: 3,
        ...tariffData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreateTariff.mockResolvedValue(createdTariff);

      const response = await request(app)
        .post('/api/tariffs')
        .send(tariffData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(tariffData.name);
    });
  });

  describe('PUT /api/tariffs/:id', () => {
    it('should update tariff', async () => {
      const updateData = {
        name: 'Updated Tariff',
        price: 600,
      };

      const updatedTariff = {
        id: 1,
        ...updateData,
        updatedAt: new Date(),
      };

      mockUpdateTariff.mockResolvedValue(updatedTariff);

      const response = await request(app)
        .put('/api/tariffs/1')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
    });
  });

  describe('DELETE /api/tariffs/:id', () => {
    it('should delete tariff', async () => {
      mockDeleteTariff.mockResolvedValue({ success: true });

      const response = await request(app)
        .delete('/api/tariffs/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockDeleteTariff).toHaveBeenCalledWith(1);
    });
  });
});
