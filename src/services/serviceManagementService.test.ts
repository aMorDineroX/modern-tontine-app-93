import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/utils/supabase';
import {
  getAllServices,
  getServiceById,
  getUserServices,
  subscribeToService,
  cancelServiceSubscription,
  getUserServiceTransactions,
  getUserActiveSubscriptions,
  isUserSubscribedToService
} from './serviceManagementService';

// Mock de supabase
vi.mock('@/utils/supabase', () => {
  const mockSingle = vi.fn();
  const mockSelect = vi.fn().mockReturnThis();
  const mockInsert = vi.fn().mockReturnThis();
  const mockUpdate = vi.fn().mockReturnThis();
  const mockEq = vi.fn().mockReturnThis();
  const mockOrder = vi.fn().mockReturnThis();
  const mockMaybeSingle = vi.fn();
  const mockRpc = vi.fn();

  // Créer une chaîne de mocks pour permettre .from().select().eq().single()
  mockSelect.mockImplementation(() => ({
    eq: mockEq,
    single: mockSingle,
    order: mockOrder,
  }));

  mockEq.mockImplementation(() => ({
    single: mockSingle,
    eq: vi.fn().mockReturnThis(),
    maybeSingle: mockMaybeSingle,
  }));

  mockOrder.mockImplementation(() => ({
    eq: mockEq,
  }));

  mockUpdate.mockImplementation(() => ({
    eq: mockEq,
  }));

  const mockFrom = vi.fn().mockImplementation(() => ({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    eq: mockEq,
  }));

  return {
    supabase: {
      from: mockFrom,
      rpc: mockRpc,
    },
  };
});

describe('serviceManagementService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllServices', () => {
    it('should return all services', async () => {
      const mockServices = [
        { id: 1, name: 'Service 1' },
        { id: 2, name: 'Service 2' },
      ];

      // Mock de la réponse de supabase
      (supabase.from as any).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockServices,
          error: null,
        }),
      }));

      const result = await getAllServices();

      expect(supabase.from).toHaveBeenCalledWith('services');
      expect(result).toEqual({
        success: true,
        data: mockServices,
      });
    });

    it('should handle errors', async () => {
      const mockError = new Error('Database error');

      // Mock de la réponse de supabase avec une erreur
      (supabase.from as any).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }));

      const result = await getAllServices();

      expect(supabase.from).toHaveBeenCalledWith('services');
      expect(result).toEqual({
        success: false,
        error: mockError,
      });
    });
  });

  describe('getServiceById', () => {
    it('should return a service with its features', async () => {
      const mockService = { id: 1, name: 'Service 1' };
      const mockFeatures = [
        { id: 1, service_id: 1, name: 'Feature 1', is_highlighted: true },
        { id: 2, service_id: 1, name: 'Feature 2', is_highlighted: false },
      ];

      // Mock de la réponse de supabase pour le service
      (supabase.from as any).mockImplementationOnce(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockService,
          error: null,
        }),
      }));

      // Mock de la réponse de supabase pour les fonctionnalités
      (supabase.from as any).mockImplementationOnce(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockFeatures,
          error: null,
        }),
      }));

      const result = await getServiceById(1);

      expect(supabase.from).toHaveBeenCalledWith('services');
      expect(supabase.from).toHaveBeenCalledWith('service_features');
      expect(result).toEqual({
        success: true,
        data: {
          ...mockService,
          features: mockFeatures,
        },
      });
    });

    it('should handle errors when fetching service', async () => {
      const mockError = new Error('Service not found');

      // Mock de la réponse de supabase avec une erreur
      (supabase.from as any).mockImplementationOnce(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }));

      const result = await getServiceById(999);

      expect(supabase.from).toHaveBeenCalledWith('services');
      expect(result).toEqual({
        success: false,
        error: mockError,
      });
    });
  });

  describe('getUserServices', () => {
    it('should return user services', async () => {
      const mockUserServices = [
        { service_id: 1, service_name: 'Service 1', subscription_status: 'active' },
        { service_id: 2, service_name: 'Service 2', subscription_status: null },
      ];

      // Mock de la réponse de supabase.rpc
      (supabase.rpc as any).mockResolvedValue({
        data: mockUserServices,
        error: null,
      });

      const result = await getUserServices('user-123');

      expect(supabase.rpc).toHaveBeenCalledWith('get_user_services', { p_user_id: 'user-123' });
      expect(result).toEqual({
        success: true,
        data: mockUserServices,
      });
    });

    it('should handle errors', async () => {
      const mockError = new Error('RPC error');

      // Mock de la réponse de supabase.rpc avec une erreur
      (supabase.rpc as any).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await getUserServices('user-123');

      expect(supabase.rpc).toHaveBeenCalledWith('get_user_services', { p_user_id: 'user-123' });
      expect(result).toEqual({
        success: false,
        error: mockError,
      });
    });
  });

  describe('subscribeToService', () => {
    it('should subscribe a user to a service', async () => {
      const mockSubscriptionId = 123;

      // Mock de la réponse de supabase.rpc
      (supabase.rpc as any).mockResolvedValue({
        data: mockSubscriptionId,
        error: null,
      });

      const result = await subscribeToService('user-123', 1, 'paypal', 'tx_123456');

      expect(supabase.rpc).toHaveBeenCalledWith('subscribe_to_service', {
        p_user_id: 'user-123',
        p_service_id: 1,
        p_payment_method: 'paypal',
        p_payment_reference: 'tx_123456',
      });
      expect(result).toEqual({
        success: true,
        data: mockSubscriptionId,
      });
    });

    it('should handle errors', async () => {
      const mockError = new Error('Subscription error');

      // Mock de la réponse de supabase.rpc avec une erreur
      (supabase.rpc as any).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await subscribeToService('user-123', 1, 'paypal', 'tx_123456');

      expect(supabase.rpc).toHaveBeenCalledWith('subscribe_to_service', {
        p_user_id: 'user-123',
        p_service_id: 1,
        p_payment_method: 'paypal',
        p_payment_reference: 'tx_123456',
      });
      expect(result).toEqual({
        success: false,
        error: mockError,
      });
    });
  });

  describe('cancelServiceSubscription', () => {
    it('should cancel a service subscription', async () => {
      // Mock de la réponse de supabase.rpc
      (supabase.rpc as any).mockResolvedValue({
        data: true,
        error: null,
      });

      const result = await cancelServiceSubscription('user-123', 456);

      expect(supabase.rpc).toHaveBeenCalledWith('cancel_service_subscription', {
        p_user_id: 'user-123',
        p_subscription_id: 456,
      });
      expect(result).toEqual({
        success: true,
        data: true,
      });
    });

    it('should handle errors', async () => {
      const mockError = new Error('Cancellation error');

      // Mock de la réponse de supabase.rpc avec une erreur
      (supabase.rpc as any).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await cancelServiceSubscription('user-123', 456);

      expect(supabase.rpc).toHaveBeenCalledWith('cancel_service_subscription', {
        p_user_id: 'user-123',
        p_subscription_id: 456,
      });
      expect(result).toEqual({
        success: false,
        error: mockError,
      });
    });
  });

  describe('isUserSubscribedToService', () => {
    it('should return true if user is subscribed', async () => {
      // Mock de la réponse de supabase
      (supabase.from as any).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: { id: 123 },
          error: null,
        }),
      }));

      const result = await isUserSubscribedToService('user-123', 1);

      expect(supabase.from).toHaveBeenCalledWith('service_subscriptions');
      expect(result).toEqual({
        success: true,
        data: true,
      });
    });

    it('should return false if user is not subscribed', async () => {
      // Mock de la réponse de supabase
      (supabase.from as any).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }));

      const result = await isUserSubscribedToService('user-123', 1);

      expect(supabase.from).toHaveBeenCalledWith('service_subscriptions');
      expect(result).toEqual({
        success: true,
        data: false,
      });
    });

    it('should handle errors', async () => {
      const mockError = new Error('Database error');

      // Mock de la réponse de supabase avec une erreur
      (supabase.from as any).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }));

      const result = await isUserSubscribedToService('user-123', 1);

      expect(supabase.from).toHaveBeenCalledWith('service_subscriptions');
      expect(result).toEqual({
        success: false,
        error: mockError,
      });
    });
  });
});
