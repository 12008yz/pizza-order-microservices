/**
 * Интеграционные тесты для связи Equipment Service с Provider Service
 * Проверяет реальное взаимодействие между сервисами
 */

import axios from 'axios';
import { EquipmentService } from '../../services/equipment.service';
import { Equipment } from '../../models/Equipment';
import { EquipmentType } from '../../models/EquipmentType';

const PROVIDER_SERVICE_URL = process.env.PROVIDER_SERVICE_URL || 'http://localhost:3003';
const EQUIPMENT_SERVICE_URL = process.env.EQUIPMENT_SERVICE_URL || 'http://localhost:3007';

// Эти тесты требуют запущенных сервисов
// Запускать только при необходимости: npm test -- --testPathPattern="integration" --testNamePattern="Equipment-Provider"
describe('Equipment-Provider Integration Tests', () => {
  let equipmentService: EquipmentService;
  let testProviderId: number | null = null;
  let testEquipmentTypeId: number | null = null;
  let testEquipmentId: number | null = null;

  beforeAll(async () => {
    equipmentService = new EquipmentService();

    // Проверяем доступность Provider Service
    try {
      const providerResponse = await axios.get(`${PROVIDER_SERVICE_URL}/api/providers`);
      if (providerResponse.data.data && providerResponse.data.data.length > 0) {
        testProviderId = providerResponse.data.data[0].id;
      }
    } catch (error) {
      console.warn('Provider Service is not available, skipping integration tests');
    }

    // Получаем тип оборудования для тестов
    try {
      const equipmentTypes = await EquipmentType.findAll({ limit: 1 });
      if (equipmentTypes.length > 0) {
        testEquipmentTypeId = equipmentTypes[0].id;
      }
    } catch (error) {
      console.warn('Cannot get equipment types, skipping integration tests');
    }
  });

  describe('Equipment Service → Provider Service', () => {
    it('should fetch provider information when getting equipment by ID', async () => {
      if (!testProviderId || !testEquipmentTypeId) {
        console.log('Skipping: Test data not available');
        return;
      }

      // Создаем тестовое оборудование
      const testEquipment = await Equipment.create({
        name: 'Test Router Integration',
        description: 'Test equipment for integration',
        providerId: testProviderId,
        equipmentTypeId: testEquipmentTypeId,
        purchasePrice: 1000,
        setupPrice: 500,
        isActive: true,
      });

      try {
        // Получаем оборудование с информацией о провайдере
        const equipment = await equipmentService.getEquipmentById(testEquipment.id);

        expect(equipment).toBeDefined();
        expect((equipment as any).provider).toBeDefined();
        expect((equipment as any).provider.id).toBe(testProviderId);

        testEquipmentId = testEquipment.id;
      } finally {
        // Очистка
        if (testEquipment) {
          await testEquipment.destroy();
        }
      }
    });

    it('should validate provider exists when creating equipment', async () => {
      if (!testProviderId || !testEquipmentTypeId) {
        console.log('Skipping: Test data not available');
        return;
      }

      // Пытаемся создать оборудование с несуществующим провайдером
      await expect(
        equipmentService.createEquipment({
          name: 'Test Equipment',
          description: 'Test',
          providerId: 999999, // Несуществующий провайдер
          equipmentTypeId: testEquipmentTypeId,
        })
      ).rejects.toThrow('Provider not found');
    });

    it('should validate provider exists when updating equipment', async () => {
      if (!testProviderId || !testEquipmentTypeId || !testEquipmentId) {
        console.log('Skipping: Test data not available');
        return;
      }

      // Пытаемся обновить оборудование с несуществующим провайдером
      await expect(
        equipmentService.updateEquipment(testEquipmentId, {
          providerId: 999999, // Несуществующий провайдер
        } as any)
      ).rejects.toThrow('Provider not found');
    });

    it('should handle provider service unavailability gracefully', async () => {
      if (!testProviderId || !testEquipmentTypeId) {
        console.log('Skipping: Test data not available');
        return;
      }

      // Создаем оборудование
      const testEquipment = await Equipment.create({
        name: 'Test Equipment Graceful',
        description: 'Test',
        providerId: testProviderId,
        equipmentTypeId: testEquipmentTypeId,
        isActive: true,
      });

      try {
        // Временно меняем URL провайдера на неверный
        const originalUrl = process.env.PROVIDER_SERVICE_URL;
        process.env.PROVIDER_SERVICE_URL = 'http://localhost:9999';

        // Должен вернуть оборудование без информации о провайдере
        const equipment = await equipmentService.getEquipmentById(testEquipment.id);
        expect(equipment).toBeDefined();
        expect((equipment as any).provider).toBeUndefined();

        // Восстанавливаем URL
        if (originalUrl) {
          process.env.PROVIDER_SERVICE_URL = originalUrl;
        } else {
          delete process.env.PROVIDER_SERVICE_URL;
        }
      } finally {
        await testEquipment.destroy();
      }
    });
  });

  describe('API Integration', () => {
    it('should return equipment with provider info via API', async () => {
      if (!testProviderId || !testEquipmentTypeId) {
        console.log('Skipping: Test data not available');
        return;
      }

      // Создаем тестовое оборудование
      const testEquipment = await Equipment.create({
        name: 'Test Equipment API',
        description: 'Test',
        providerId: testProviderId,
        equipmentTypeId: testEquipmentTypeId,
        isActive: true,
      });

      try {
        const response = await axios.get(
          `${EQUIPMENT_SERVICE_URL}/api/equipment/${testEquipment.id}`
        );

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toBeDefined();
        expect(response.data.data.provider).toBeDefined();
        expect(response.data.data.provider.id).toBe(testProviderId);
      } finally {
        await testEquipment.destroy();
      }
    });
  });

  afterAll(async () => {
    // Очистка тестовых данных
    if (testEquipmentId) {
      try {
        const equipment = await Equipment.findByPk(testEquipmentId);
        if (equipment) {
          await equipment.destroy();
        }
      } catch (error) {
        // Игнорируем ошибки очистки
      }
    }
  });
});
