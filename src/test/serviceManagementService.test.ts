import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAllServices,
  getUserServices,
  getServiceById,
  subscribeToService,
  cancelServiceSubscription
} from '../services/serviceManagementService';
import { supabase } from '../utils/supabase';

// Mock de Supabase
vi.mock('../utils/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    match: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    rpc: vi.fn().mockReturnThis(),
  }
}));

describe('serviceManagementService', () => {
  const mockServices = [
    {
      id: 1,
      name: 'Premium',
      description: 'Service premium avec fonctionnalités avancées',
      icon: 'crown',
      price: 9.99,
      currency: 'EUR',
      is_recurring: true,
      recurring_interval: 'month'
    },
    {
      id: 2,
      name: 'Assurance Tontine',
      description: 'Assurance pour vos groupes de tontine',
      icon: 'shield',
      price: 4.99,
      currency: 'EUR',
      is_recurring: true,
      recurring_interval: 'month'
    }
  ];

  const mockUserServices = [
    {
      id: 1,
      user_id: 'user-123',
      service_id: 1,
      start_date: '2023-01-01',
      end_date: null,
      status: 'active',
      payment_method: 'card',
      payment_id: 'payment-123'
    }
  ];

  const mockServiceDetails = {
    id: 1,
    name: 'Premium',
    description: 'Service premium avec fonctionnalités avancées',
    icon: 'crown',
    price: 9.99,
    currency: 'EUR',
    is_recurring: true,
    recurring_interval: 'month',
    features: [
      {
        id: 1,
        service_id: 1,
        name: 'Groupes illimités',
        description: 'Créez autant de groupes que vous voulez'
      },
      {
        id: 2,
        service_id: 1,
        name: 'Support prioritaire',
        description: 'Accédez à un support client prioritaire'
      }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllServices', () => {
    it('should return all services', async () => {
      // Mock de la réponse de Supabase
      (supabase.select as any).mockResolvedValue({
        data: mockServices,
        error: null
      });

      const result = await getAllServices();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockServices);
      expect(supabase.from).toHaveBeenCalledWith('services');
      expect(supabase.select).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      // Mock d'une erreur
      (supabase.select as any).mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      const result = await getAllServices();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('getUserServices', () => {
    it('should return user services', async () => {
      // Mock de la réponse de Supabase
      (supabase.select as any).mockResolvedValue({
        data: mockUserServices,
        error: null
      });

      const result = await getUserServices('user-123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUserServices);
      expect(supabase.from).toHaveBeenCalledWith('service_subscriptions');
      expect(supabase.select).toHaveBeenCalled();
      expect(supabase.eq).toHaveBeenCalledWith('user_id', 'user-123');
    });
  });

  describe('getServiceById', () => {
    it('should return service details with features', async () => {
      // Mock de la réponse de Supabase pour le service
      (supabase.single as any).mockResolvedValueOnce({
        data: mockServices[0],
        error: null
      });

      // Mock de la réponse de Supabase pour les fonctionnalités
      (supabase.order as any).mockResolvedValueOnce({
        data: mockServiceDetails.features,
        error: null
      });

      const result = await getServiceById(1);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        ...mockServices[0],
        features: mockServiceDetails.features
      });
      expect(supabase.from).toHaveBeenCalledWith('services');
      expect(supabase.select).toHaveBeenCalledWith('*');
      expect(supabase.eq).toHaveBeenCalledWith('id', 1);
    });
  });

  describe('subscribeToService', () => {
    it('should subscribe a user to a service', async () => {
      // Mock de la réponse de Supabase
      (supabase.insert as any).mockResolvedValue({
        data: { id: 1 },
        error: null
      });

      const result = await subscribeToService('user-123', 1, 'card', 'payment-123');

      expect(result.success).toBe(true);
      expect(result.data).toBe(1);
      expect(supabase.from).toHaveBeenCalledWith('service_subscriptions');
      expect(supabase.insert).toHaveBeenCalledWith({
        user_id: 'user-123',
        service_id: 1,
        start_date: expect.any(String),
        status: 'active',
        payment_method: 'card',
        payment_id: 'payment-123'
      });
    });
  });

  describe('cancelServiceSubscription', () => {
    it('should cancel a subscription', async () => {
      // Mock de la réponse de Supabase
      (supabase.rpc as any).mockResolvedValue({
        data: true,
        error: null
      });

      const result = await cancelServiceSubscription('user-123', 1);

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
      expect(supabase.rpc).toHaveBeenCalledWith('cancel_service_subscription', {
        p_user_id: 'user-123',
        p_subscription_id: 1
      });
    });
  });
});
