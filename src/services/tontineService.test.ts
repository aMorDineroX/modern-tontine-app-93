import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/utils/supabase';
import {
  createTontineGroup,
  getUserGroups,
  getGroupDetails,
  addMemberToGroup,
  getGroupMembers,
  updateMemberStatus,
  recordContribution,
  getUserContributions,
  updateContributionStatus,
  schedulePayout,
  getUserPayouts,
  getGroupPayouts,
  updatePayoutStatus,
  updateUserProfile,
  getUserProfile
} from './tontineService';

// Mock de supabase
vi.mock('@/utils/supabase', () => {
  const mockSingle = vi.fn();
  const mockSelect = vi.fn().mockReturnThis();
  const mockInsert = vi.fn().mockReturnThis();
  const mockUpdate = vi.fn().mockReturnThis();
  const mockEq = vi.fn().mockReturnThis();

  // Créer une chaîne de mocks pour permettre .from().select().eq().single()
  mockSelect.mockImplementation(() => ({
    eq: mockEq,
    single: mockSingle,
  }));

  mockEq.mockImplementation(() => ({
    single: mockSingle,
    eq: vi.fn().mockReturnThis(),
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
    },
  };
});

describe('tontineService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createTontineGroup', () => {
    it('should create a tontine group', async () => {
      // Configurer le mock pour retourner des données de succès
      const mockData = { id: '123', name: 'Test Group' };
      const mockResponse = {
        data: mockData,
        error: null,
      };

      // Configurer la chaîne de mocks
      const mockSingle = vi.fn().mockResolvedValue(mockResponse);
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });

      // Remplacer le mock de from
      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
      });

      // Appeler la fonction
      const result = await createTontineGroup({
        name: 'Test Group',
        contribution_amount: 100,
        frequency: 'monthly',
        created_by: 'user-123',
      });

      // Vérifier que les fonctions ont été appelées correctement
      expect(supabase.from).toHaveBeenCalledWith('tontine_groups');
      expect(mockInsert).toHaveBeenCalledWith({
        name: 'Test Group',
        contribution_amount: 100,
        frequency: 'monthly',
        created_by: 'user-123',
      });
      expect(mockSelect).toHaveBeenCalled();
      expect(mockSingle).toHaveBeenCalled();

      // Vérifier le résultat
      expect(result).toEqual(mockData);
    });

    it('should throw an error if the request fails', async () => {
      // Configurer le mock pour retourner une erreur
      const mockError = new Error('Failed to create group');
      const mockResponse = {
        data: null,
        error: mockError,
      };

      // Configurer la chaîne de mocks
      const mockSingle = vi.fn().mockResolvedValue(mockResponse);
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });

      // Remplacer le mock de from
      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
      });

      // Vérifier que la fonction lance une erreur
      await expect(createTontineGroup({
        name: 'Test Group',
        contribution_amount: 100,
        frequency: 'monthly',
        created_by: 'user-123',
      })).rejects.toThrow(mockError);
    });
  });

  describe('getUserGroups', () => {
    it('should get user groups', async () => {
      // Configurer le mock pour retourner des données de succès
      const mockData = [{ id: '123', name: 'Test Group' }];
      const mockResponse = {
        data: mockData,
        error: null,
      };

      // Configurer la chaîne de mocks
      const mockEq = vi.fn().mockResolvedValue(mockResponse);
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      // Remplacer le mock de from
      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });

      // Appeler la fonction
      const result = await getUserGroups('user-123');

      // Vérifier que les fonctions ont été appelées correctement
      expect(supabase.from).toHaveBeenCalledWith('tontine_groups');
      expect(mockSelect).toHaveBeenCalledWith(`
      *,
      group_members!inner(*)
    `);
      expect(mockEq).toHaveBeenCalledWith('group_members.user_id', 'user-123');

      // Vérifier le résultat
      expect(result).toEqual(mockData);
    });
  });

  describe('getGroupDetails', () => {
    it('should get group details', async () => {
      // Configurer le mock pour retourner des données de succès
      const mockData = { id: '123', name: 'Test Group' };
      const mockResponse = {
        data: mockData,
        error: null,
      };

      // Configurer la chaîne de mocks
      const mockSingle = vi.fn().mockResolvedValue(mockResponse);
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      // Remplacer le mock de from
      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });

      // Appeler la fonction
      const result = await getGroupDetails('123');

      // Vérifier que les fonctions ont été appelées correctement
      expect(supabase.from).toHaveBeenCalledWith('tontine_groups');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('id', '123');
      expect(mockSingle).toHaveBeenCalled();

      // Vérifier le résultat
      expect(result).toEqual(mockData);
    });
  });

  describe('addMemberToGroup', () => {
    it('should add a member to a group', async () => {
      // Configurer le mock pour retourner des données de succès
      const mockData = { id: '123', group_id: 'group-123', user_id: 'user-123' };
      const mockResponse = {
        data: mockData,
        error: null,
      };

      // Configurer la chaîne de mocks
      const mockSingle = vi.fn().mockResolvedValue(mockResponse);
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });

      // Remplacer le mock de from
      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
      });

      // Appeler la fonction
      const result = await addMemberToGroup({
        group_id: 'group-123',
        user_id: 'user-123',
        role: 'member',
        status: 'active',
      });

      // Vérifier que les fonctions ont été appelées correctement
      expect(supabase.from).toHaveBeenCalledWith('group_members');
      expect(mockInsert).toHaveBeenCalledWith({
        group_id: 'group-123',
        user_id: 'user-123',
        role: 'member',
        status: 'active',
      });
      expect(mockSelect).toHaveBeenCalled();
      expect(mockSingle).toHaveBeenCalled();

      // Vérifier le résultat
      expect(result).toEqual(mockData);
    });
  });

  describe('getGroupMembers', () => {
    it('should get group members', async () => {
      // Configurer le mock pour retourner des données de succès
      const mockData = [{ id: '123', user_id: 'user-123', profiles: { full_name: 'Test User' } }];
      const mockResponse = {
        data: mockData,
        error: null,
      };

      // Configurer la chaîne de mocks
      const mockEq = vi.fn().mockResolvedValue(mockResponse);
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      // Remplacer le mock de from
      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });

      // Appeler la fonction
      const result = await getGroupMembers('group-123');

      // Vérifier que les fonctions ont été appelées correctement
      expect(supabase.from).toHaveBeenCalledWith('group_members');
      expect(mockSelect).toHaveBeenCalledWith(`
      *,
      profiles:user_id(full_name, avatar_url)
    `);
      expect(mockEq).toHaveBeenCalledWith('group_id', 'group-123');

      // Vérifier le résultat
      expect(result).toEqual(mockData);
    });
  });

  describe('updateMemberStatus', () => {
    it('should update member status', async () => {
      // Configurer le mock pour retourner des données de succès
      const mockData = { id: '123', status: 'inactive' };
      const mockResponse = {
        data: mockData,
        error: null,
      };

      // Configurer la chaîne de mocks
      const mockSingle = vi.fn().mockResolvedValue(mockResponse);
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });

      // Remplacer le mock de from
      (supabase.from as any).mockReturnValue({
        update: mockUpdate,
      });

      // Appeler la fonction
      const result = await updateMemberStatus('123', 'inactive');

      // Vérifier que les fonctions ont été appelées correctement
      expect(supabase.from).toHaveBeenCalledWith('group_members');
      expect(mockUpdate).toHaveBeenCalledWith({ status: 'inactive' });
      expect(mockEq).toHaveBeenCalledWith('id', '123');
      expect(mockSelect).toHaveBeenCalled();
      expect(mockSingle).toHaveBeenCalled();

      // Vérifier le résultat
      expect(result).toEqual(mockData);
    });
  });

  describe('recordContribution', () => {
    it('should record a contribution', async () => {
      // Configurer le mock pour retourner des données de succès
      const mockData = { id: '123', amount: 100 };
      const mockResponse = {
        data: mockData,
        error: null,
      };

      // Configurer la chaîne de mocks
      const mockSingle = vi.fn().mockResolvedValue(mockResponse);
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });

      // Remplacer le mock de from
      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
      });

      // Appeler la fonction
      const result = await recordContribution({
        group_id: 'group-123',
        user_id: 'user-123',
        amount: 100,
        status: 'pending',
      });

      // Vérifier que les fonctions ont été appelées correctement
      expect(supabase.from).toHaveBeenCalledWith('contributions');
      expect(mockInsert).toHaveBeenCalledWith({
        group_id: 'group-123',
        user_id: 'user-123',
        amount: 100,
        status: 'pending',
      });
      expect(mockSelect).toHaveBeenCalled();
      expect(mockSingle).toHaveBeenCalled();

      // Vérifier le résultat
      expect(result).toEqual(mockData);
    });
  });

  describe('getUserContributions', () => {
    it('should get user contributions without group filter', async () => {
      // Configurer le mock pour retourner des données de succès
      const mockData = [{ id: '123', amount: 100 }];
      const mockResponse = {
        data: mockData,
        error: null,
      };

      // Configurer la chaîne de mocks
      const mockEq = vi.fn().mockResolvedValue(mockResponse);
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      // Remplacer le mock de from
      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });

      // Appeler la fonction
      const result = await getUserContributions('user-123');

      // Vérifier que les fonctions ont été appelées correctement
      expect(supabase.from).toHaveBeenCalledWith('contributions');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123');

      // Vérifier le résultat
      expect(result).toEqual(mockData);
    });

    it('should get user contributions with group filter', async () => {
      // Configurer le mock pour retourner des données de succès
      const mockData = [{ id: '123', amount: 100 }];
      const mockResponse = {
        data: mockData,
        error: null,
      };

      // Configurer la chaîne de mocks
      const mockEq2 = vi.fn().mockResolvedValue(mockResponse);
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });

      // Remplacer le mock de from
      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });

      // Appeler la fonction
      const result = await getUserContributions('user-123', 'group-123');

      // Vérifier que les fonctions ont été appelées correctement
      expect(supabase.from).toHaveBeenCalledWith('contributions');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq1).toHaveBeenCalledWith('user_id', 'user-123');
      expect(mockEq2).toHaveBeenCalledWith('group_id', 'group-123');

      // Vérifier le résultat
      expect(result).toEqual(mockData);
    });
  });

  describe('updateContributionStatus', () => {
    it('should update contribution status', async () => {
      // Configurer le mock pour retourner des données de succès
      const mockData = { id: '123', status: 'completed' };
      const mockResponse = {
        data: mockData,
        error: null,
      };

      // Configurer la chaîne de mocks
      const mockSingle = vi.fn().mockResolvedValue(mockResponse);
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });

      // Remplacer le mock de from
      (supabase.from as any).mockReturnValue({
        update: mockUpdate,
      });

      // Appeler la fonction
      const result = await updateContributionStatus('123', 'completed');

      // Vérifier que les fonctions ont été appelées correctement
      expect(supabase.from).toHaveBeenCalledWith('contributions');
      expect(mockUpdate).toHaveBeenCalledWith({ status: 'completed' });
      expect(mockEq).toHaveBeenCalledWith('id', '123');
      expect(mockSelect).toHaveBeenCalled();
      expect(mockSingle).toHaveBeenCalled();

      // Vérifier le résultat
      expect(result).toEqual(mockData);
    });
  });

  describe('schedulePayout', () => {
    it('should schedule a payout', async () => {
      // Configurer le mock pour retourner des données de succès
      const mockData = { id: '123', amount: 1000 };
      const mockResponse = {
        data: mockData,
        error: null,
      };

      // Configurer la chaîne de mocks
      const mockSingle = vi.fn().mockResolvedValue(mockResponse);
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });

      // Remplacer le mock de from
      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
      });

      // Appeler la fonction
      const result = await schedulePayout({
        group_id: 'group-123',
        user_id: 'user-123',
        amount: 1000,
        scheduled_date: new Date(),
        status: 'pending',
      });

      // Vérifier que les fonctions ont été appelées correctement
      expect(supabase.from).toHaveBeenCalledWith('payouts');
      expect(mockInsert).toHaveBeenCalledWith({
        group_id: 'group-123',
        user_id: 'user-123',
        amount: 1000,
        scheduled_date: expect.any(Date),
        status: 'pending',
      });
      expect(mockSelect).toHaveBeenCalled();
      expect(mockSingle).toHaveBeenCalled();

      // Vérifier le résultat
      expect(result).toEqual(mockData);
    });
  });

  describe('getUserPayouts', () => {
    it('should get user payouts without group filter', async () => {
      // Configurer le mock pour retourner des données de succès
      const mockData = [{ id: '123', amount: 1000 }];
      const mockResponse = {
        data: mockData,
        error: null,
      };

      // Configurer la chaîne de mocks
      const mockEq = vi.fn().mockResolvedValue(mockResponse);
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      // Remplacer le mock de from
      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });

      // Appeler la fonction
      const result = await getUserPayouts('user-123');

      // Vérifier que les fonctions ont été appelées correctement
      expect(supabase.from).toHaveBeenCalledWith('payouts');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123');

      // Vérifier le résultat
      expect(result).toEqual(mockData);
    });

    it('should get user payouts with group filter', async () => {
      // Configurer le mock pour retourner des données de succès
      const mockData = [{ id: '123', amount: 1000 }];
      const mockResponse = {
        data: mockData,
        error: null,
      };

      // Configurer la chaîne de mocks
      const mockEq2 = vi.fn().mockResolvedValue(mockResponse);
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });

      // Remplacer le mock de from
      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });

      // Appeler la fonction
      const result = await getUserPayouts('user-123', 'group-123');

      // Vérifier que les fonctions ont été appelées correctement
      expect(supabase.from).toHaveBeenCalledWith('payouts');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq1).toHaveBeenCalledWith('user_id', 'user-123');
      expect(mockEq2).toHaveBeenCalledWith('group_id', 'group-123');

      // Vérifier le résultat
      expect(result).toEqual(mockData);
    });
  });

  describe('getGroupPayouts', () => {
    it('should get group payouts', async () => {
      // Configurer le mock pour retourner des données de succès
      const mockData = [{ id: '123', amount: 1000 }];
      const mockResponse = {
        data: mockData,
        error: null,
      };

      // Configurer la chaîne de mocks
      const mockEq = vi.fn().mockResolvedValue(mockResponse);
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      // Remplacer le mock de from
      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });

      // Appeler la fonction
      const result = await getGroupPayouts('group-123');

      // Vérifier que les fonctions ont été appelées correctement
      expect(supabase.from).toHaveBeenCalledWith('payouts');
      expect(mockSelect).toHaveBeenCalledWith(`
      *,
      profiles:user_id(full_name, avatar_url)
    `);
      expect(mockEq).toHaveBeenCalledWith('group_id', 'group-123');

      // Vérifier le résultat
      expect(result).toEqual(mockData);
    });
  });

  describe('updatePayoutStatus', () => {
    it('should update payout status', async () => {
      // Configurer le mock pour retourner des données de succès
      const mockData = { id: '123', status: 'completed' };
      const mockResponse = {
        data: mockData,
        error: null,
      };

      // Configurer la chaîne de mocks
      const mockSingle = vi.fn().mockResolvedValue(mockResponse);
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });

      // Remplacer le mock de from
      (supabase.from as any).mockReturnValue({
        update: mockUpdate,
      });

      // Appeler la fonction
      const result = await updatePayoutStatus('123', 'completed');

      // Vérifier que les fonctions ont été appelées correctement
      expect(supabase.from).toHaveBeenCalledWith('payouts');
      expect(mockUpdate).toHaveBeenCalledWith({ status: 'completed' });
      expect(mockEq).toHaveBeenCalledWith('id', '123');
      expect(mockSelect).toHaveBeenCalled();
      expect(mockSingle).toHaveBeenCalled();

      // Vérifier le résultat
      expect(result).toEqual(mockData);
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile', async () => {
      // Configurer le mock pour retourner des données de succès
      const mockData = { id: 'user-123', full_name: 'Updated Name' };
      const mockResponse = {
        data: mockData,
        error: null,
      };

      // Configurer la chaîne de mocks
      const mockSingle = vi.fn().mockResolvedValue(mockResponse);
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });

      // Remplacer le mock de from
      (supabase.from as any).mockReturnValue({
        update: mockUpdate,
      });

      // Appeler la fonction
      const result = await updateUserProfile('user-123', {
        full_name: 'Updated Name',
        avatar_url: 'new-avatar.jpg',
      });

      // Vérifier que les fonctions ont été appelées correctement
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(mockUpdate).toHaveBeenCalledWith({
        full_name: 'Updated Name',
        avatar_url: 'new-avatar.jpg',
      });
      expect(mockEq).toHaveBeenCalledWith('id', 'user-123');
      expect(mockSelect).toHaveBeenCalled();
      expect(mockSingle).toHaveBeenCalled();

      // Vérifier le résultat
      expect(result).toEqual(mockData);
    });
  });

  describe('getUserProfile', () => {
    it('should get user profile', async () => {
      // Configurer le mock pour retourner des données de succès
      const mockData = { id: 'user-123', full_name: 'Test User' };
      const mockResponse = {
        data: mockData,
        error: null,
      };

      // Configurer la chaîne de mocks
      const mockSingle = vi.fn().mockResolvedValue(mockResponse);
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      // Remplacer le mock de from
      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });

      // Appeler la fonction
      const result = await getUserProfile('user-123');

      // Vérifier que les fonctions ont été appelées correctement
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('id', 'user-123');
      expect(mockSingle).toHaveBeenCalled();

      // Vérifier le résultat
      expect(result).toEqual(mockData);
    });
  });
});
