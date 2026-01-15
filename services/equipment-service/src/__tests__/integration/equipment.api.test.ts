import request from 'supertest';
import express from 'express';
import { errorHandler } from '../../middleware/errorHandler';

// Мокируем EquipmentService перед импортом роутов
const mockGetAllEquipmentTypes = jest.fn();
const mockGetEquipmentTypeById = jest.fn();
const mockGetAllEquipment = jest.fn();
const mockGetEquipmentById = jest.fn();
const mockGetEquipmentByProvider = jest.fn();
const mockCreateEquipment = jest.fn();
const mockUpdateEquipment = jest.fn();
const mockDeleteEquipment = jest.fn();

jest.mock('../../services/equipment.service', () => {
  return {
    EquipmentService: jest.fn().mockImplementation(() => ({
      getAllEquipmentTypes: mockGetAllEquipmentTypes,
      getEquipmentTypeById: mockGetEquipmentTypeById,
      getAllEquipment: mockGetAllEquipment,
      getEquipmentById: mockGetEquipmentById,
      getEquipmentByProvider: mockGetEquipmentByProvider,
      createEquipment: mockCreateEquipment,
      updateEquipment: mockUpdateEquipment,
      deleteEquipment: mockDeleteEquipment,
    })),
  };
});

// Импортируем роуты после мокирования
import equipmentRoutes from '../../routes/equipment.routes';

describe('Equipment API Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/equipment', equipmentRoutes);
    app.use(errorHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/equipment/types', () => {
    it('should return all equipment types', async () => {
      const mockTypes = [
        { id: 1, name: 'Роутер', slug: 'router' },
        { id: 2, name: 'ТВ-приставка', slug: 'tv-set-top' },
        { id: 3, name: 'SIM-карта', slug: 'sim-card' },
      ];

      mockGetAllEquipmentTypes.mockResolvedValue(mockTypes);

      const response = await request(app)
        .get('/api/equipment/types')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
    });
  });

  describe('GET /api/equipment/types/:id', () => {
    it('should return equipment type by id', async () => {
      const mockType = {
        id: 1,
        name: 'Роутер',
        slug: 'router',
      };

      mockGetEquipmentTypeById.mockResolvedValue(mockType);

      const response = await request(app)
        .get('/api/equipment/types/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
      expect(response.body.data.name).toBe('Роутер');
    });
  });

  describe('GET /api/equipment', () => {
    it('should return all equipment', async () => {
      const mockEquipment = [
        { id: 1, name: 'Router 1', providerId: 1 },
        { id: 2, name: 'Router 2', providerId: 2 },
      ];

      mockGetAllEquipment.mockResolvedValue(mockEquipment);

      const response = await request(app)
        .get('/api/equipment')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter equipment by providerId', async () => {
      const mockEquipment = [
        { id: 1, name: 'Router 1', providerId: 1 },
      ];

      mockGetAllEquipment.mockResolvedValue(mockEquipment);

      const response = await request(app)
        .get('/api/equipment?providerId=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockGetAllEquipment).toHaveBeenCalledWith({
        providerId: 1,
      });
    });

    it('should filter equipment by equipmentTypeId', async () => {
      const mockEquipment = [
        { id: 1, name: 'Router 1', equipmentTypeId: 1 },
      ];

      mockGetAllEquipment.mockResolvedValue(mockEquipment);

      const response = await request(app)
        .get('/api/equipment?equipmentTypeId=1')
        .expect(200);

      expect(mockGetAllEquipment).toHaveBeenCalledWith({
        equipmentTypeId: 1,
      });
    });
  });

  describe('GET /api/equipment/:id', () => {
    it('should return equipment by id', async () => {
      const mockEquipment = {
        id: 1,
        name: 'Router 1',
        providerId: 1,
        purchasePrice: 5000,
        rentalMonthlyPrice: 500,
      };

      mockGetEquipmentById.mockResolvedValue(mockEquipment);

      const response = await request(app)
        .get('/api/equipment/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
      expect(response.body.data.name).toBe('Router 1');
    });
  });

  describe('GET /api/equipment/by-provider/:provider_id', () => {
    it('should return equipment by provider id', async () => {
      const mockEquipment = [
        { id: 1, name: 'Router 1', providerId: 1 },
        { id: 2, name: 'TV Set-top 1', providerId: 1 },
      ];

      mockGetEquipmentByProvider.mockResolvedValue(mockEquipment);

      const response = await request(app)
        .get('/api/equipment/by-provider/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(mockGetEquipmentByProvider).toHaveBeenCalledWith(1);
    });
  });

  describe('POST /api/equipment', () => {
    it('should create new equipment', async () => {
      const equipmentData = {
        name: 'New Router',
        providerId: 1,
        equipmentTypeId: 1,
        purchasePrice: 5000,
        rentalMonthlyPrice: 500,
        setupPrice: 1000,
      };

      const createdEquipment = {
        id: 3,
        ...equipmentData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreateEquipment.mockResolvedValue(createdEquipment);

      const response = await request(app)
        .post('/api/equipment')
        .send(equipmentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(equipmentData.name);
      expect(mockCreateEquipment).toHaveBeenCalledWith(equipmentData);
    });
  });

  describe('PUT /api/equipment/:id', () => {
    it('should update equipment', async () => {
      const updateData = {
        name: 'Updated Router',
        purchasePrice: 6000,
      };

      const updatedEquipment = {
        id: 1,
        ...updateData,
        updatedAt: new Date(),
      };

      mockUpdateEquipment.mockResolvedValue(updatedEquipment);

      const response = await request(app)
        .put('/api/equipment/1')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(mockUpdateEquipment).toHaveBeenCalledWith(1, updateData);
    });
  });

  describe('DELETE /api/equipment/:id', () => {
    it('should delete equipment', async () => {
      mockDeleteEquipment.mockResolvedValue({ success: true });

      const response = await request(app)
        .delete('/api/equipment/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockDeleteEquipment).toHaveBeenCalledWith(1);
    });
  });
});
