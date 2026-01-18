import { OrderService } from '../../services/order.service';
import { Order, OrderItem, OrderStatusHistory } from '../../models';
import axios from 'axios';

// Мокируем axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('OrderService', () => {
  let orderService: OrderService;

  beforeEach(() => {
    orderService = new OrderService();
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create order with valid data', async () => {
      const mockOrder = {
        id: 1,
        userId: 1,
        tariffId: 1,
        providerId: 1,
        fullName: 'Test User',
        phone: '+79991234567',
        status: 'new',
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: { success: true, data: { id: 1 } },
      });

      mockedAxios.get.mockResolvedValueOnce({
        data: { success: true, data: { id: 1, name: 'Tariff', price: 1000 } },
      });

      mockedAxios.post.mockResolvedValueOnce({
        data: { success: true },
      });

      (Order.create as jest.Mock).mockResolvedValue(mockOrder);
      (OrderStatusHistory.create as jest.Mock).mockResolvedValue({});

      const result = await orderService.createOrder({
        tariffId: 1,
        providerId: 1,
        fullName: 'Test User',
        phone: '+79991234567',
      });

      expect(Order.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw error if phone is missing', async () => {
      await expect(
        orderService.createOrder({
          tariffId: 1,
          providerId: 1,
          fullName: 'Test User',
          phone: '',
        })
      ).rejects.toThrow('Phone number is required');
    });

    it('should throw error if tariff not found', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { success: true, data: { id: 1 } },
      });

      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 404 },
      });

      await expect(
        orderService.createOrder({
          tariffId: 999,
          providerId: 1,
          fullName: 'Test User',
          phone: '+79991234567',
        })
      ).rejects.toThrow('Tariff not found');
    });
  });

  describe('calculateOrderCost', () => {
    it('should calculate order cost correctly', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            id: 1,
            name: 'Tariff',
            price: '1000',
            connectionPrice: '500',
          },
        },
      });

      const result = await orderService.calculateOrderCost({
        tariffId: 1,
        routerOption: 'purchase',
        tvSettopOption: 'rent',
      });

      expect(result.totalMonthlyPrice).toBeGreaterThan(0);
      expect(result.routerPrice).toBe(2000);
      expect(result.tvSettopPrice).toBe(300);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status and create history', async () => {
      const mockOrder = {
        id: 1,
        status: 'new',
        userId: 1,
        email: 'test@example.com',
        phone: '+79991234567',
        update: jest.fn().mockResolvedValue({}),
      };

      (Order.findByPk as jest.Mock).mockResolvedValue(mockOrder);
      (OrderStatusHistory.create as jest.Mock).mockResolvedValue({});
      mockedAxios.post.mockResolvedValue({ data: { success: true } });

      const result = await orderService.updateOrderStatus(1, 'processing', '1', 'Test comment');

      expect(mockOrder.update).toHaveBeenCalledWith({ status: 'processing' });
      expect(OrderStatusHistory.create).toHaveBeenCalled();
      expect(mockedAxios.post).toHaveBeenCalled();
    });
  });

  describe('getOrderStatusHistory', () => {
    it('should return order status history', async () => {
      const mockHistory = [
        { id: 1, orderId: 1, status: 'new', createdAt: new Date() },
        { id: 2, orderId: 1, status: 'processing', createdAt: new Date() },
      ];

      (OrderStatusHistory.findAll as jest.Mock).mockResolvedValue(mockHistory);

      const result = await orderService.getOrderStatusHistory(1);

      expect(result).toEqual(mockHistory);
      expect(OrderStatusHistory.findAll).toHaveBeenCalledWith({
        where: { orderId: 1 },
        order: [['createdAt', 'ASC']],
      });
    });
  });
});
