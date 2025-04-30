import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EnhancedNotificationCenter from '../components/EnhancedNotificationCenter';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  subscribeToUserNotifications
} from '../services/enhancedNotificationService';
import { BrowserRouter } from 'react-router-dom';

// Mock des hooks et services
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('../hooks/use-toast', () => ({
  useToast: vi.fn()
}));

vi.mock('../services/enhancedNotificationService', () => ({
  getUserNotifications: vi.fn(),
  markNotificationAsRead: vi.fn(),
  markAllNotificationsAsRead: vi.fn(),
  subscribeToUserNotifications: vi.fn()
}));

describe('EnhancedNotificationCenter', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockToast = { toast: vi.fn() };
  const mockNavigate = vi.fn();
  const mockSubscription = { unsubscribe: vi.fn() };
  
  const mockNotifications = [
    {
      id: 'notif-1',
      user_id: 'user-123',
      title: 'Nouveau message',
      message: 'Vous avez reçu un nouveau message',
      type: 'info',
      read: false,
      created_at: '2023-07-01T10:00:00Z'
    },
    {
      id: 'notif-2',
      user_id: 'user-123',
      title: 'Paiement réussi',
      message: 'Votre paiement a été traité avec succès',
      type: 'success',
      read: true,
      created_at: '2023-07-02T10:00:00Z'
    }
  ];
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock des hooks
    (useAuth as any).mockReturnValue({ user: mockUser });
    (useToast as any).mockReturnValue(mockToast);
    
    // Mock des services
    (getUserNotifications as any).mockResolvedValue({ success: true, data: mockNotifications });
    (markNotificationAsRead as any).mockResolvedValue({ success: true, data: true });
    (markAllNotificationsAsRead as any).mockResolvedValue({ success: true, data: true });
    (subscribeToUserNotifications as any).mockReturnValue(mockSubscription);
    
    // Mock de useNavigate
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => mockNavigate
      };
    });
  });
  
  it('should render the notification center', async () => {
    render(
      <BrowserRouter>
        <EnhancedNotificationCenter />
      </BrowserRouter>
    );
    
    // Vérifier que le titre est affiché
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    
    // Vérifier que les onglets sont affichés
    expect(screen.getByText('Toutes')).toBeInTheDocument();
    expect(screen.getByText('Non lues')).toBeInTheDocument();
    expect(screen.getByText('Succès')).toBeInTheDocument();
    expect(screen.getByText('Alertes')).toBeInTheDocument();
    
    // Vérifier que les notifications sont chargées
    await waitFor(() => {
      expect(getUserNotifications).toHaveBeenCalledWith(mockUser.id);
    });
    
    // Vérifier que les notifications sont affichées
    await waitFor(() => {
      expect(screen.getByText('Nouveau message')).toBeInTheDocument();
      expect(screen.getByText('Paiement réussi')).toBeInTheDocument();
    });
  });
  
  it('should mark a notification as read when clicked', async () => {
    render(
      <BrowserRouter>
        <EnhancedNotificationCenter />
      </BrowserRouter>
    );
    
    // Attendre que les notifications soient chargées
    await waitFor(() => {
      expect(screen.getByText('Nouveau message')).toBeInTheDocument();
    });
    
    // Cliquer sur une notification
    fireEvent.click(screen.getByText('Nouveau message'));
    
    // Vérifier que la notification est marquée comme lue
    await waitFor(() => {
      expect(markNotificationAsRead).toHaveBeenCalledWith('notif-1');
    });
  });
  
  it('should mark all notifications as read', async () => {
    render(
      <BrowserRouter>
        <EnhancedNotificationCenter />
      </BrowserRouter>
    );
    
    // Attendre que les notifications soient chargées
    await waitFor(() => {
      expect(screen.getByText('Nouveau message')).toBeInTheDocument();
    });
    
    // Cliquer sur le bouton "Tout marquer comme lu"
    fireEvent.click(screen.getByText('Tout marquer comme lu'));
    
    // Vérifier que toutes les notifications sont marquées comme lues
    await waitFor(() => {
      expect(markAllNotificationsAsRead).toHaveBeenCalledWith(mockUser.id);
    });
    
    // Vérifier que le toast est affiché
    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: "Succès",
        description: "Toutes les notifications ont été marquées comme lues",
      });
    });
  });
  
  it('should filter notifications by tab', async () => {
    render(
      <BrowserRouter>
        <EnhancedNotificationCenter />
      </BrowserRouter>
    );
    
    // Attendre que les notifications soient chargées
    await waitFor(() => {
      expect(screen.getByText('Nouveau message')).toBeInTheDocument();
      expect(screen.getByText('Paiement réussi')).toBeInTheDocument();
    });
    
    // Cliquer sur l'onglet "Non lues"
    fireEvent.click(screen.getByText('Non lues'));
    
    // Vérifier que seules les notifications non lues sont affichées
    await waitFor(() => {
      expect(screen.getByText('Nouveau message')).toBeInTheDocument();
      expect(screen.queryByText('Paiement réussi')).not.toBeInTheDocument();
    });
    
    // Cliquer sur l'onglet "Succès"
    fireEvent.click(screen.getByText('Succès'));
    
    // Vérifier que seules les notifications de succès sont affichées
    await waitFor(() => {
      expect(screen.queryByText('Nouveau message')).not.toBeInTheDocument();
      expect(screen.getByText('Paiement réussi')).toBeInTheDocument();
    });
  });
  
  it('should subscribe to new notifications', async () => {
    render(
      <BrowserRouter>
        <EnhancedNotificationCenter />
      </BrowserRouter>
    );
    
    // Vérifier que l'abonnement est créé
    await waitFor(() => {
      expect(subscribeToUserNotifications).toHaveBeenCalledWith(
        mockUser.id,
        expect.any(Function)
      );
    });
    
    // Simuler une nouvelle notification
    const callback = (subscribeToUserNotifications as any).mock.calls[0][1];
    const newNotification = {
      id: 'notif-3',
      user_id: 'user-123',
      title: 'Nouvelle alerte',
      message: 'Ceci est une nouvelle alerte',
      type: 'warning',
      read: false,
      created_at: '2023-07-03T10:00:00Z'
    };
    
    callback(newNotification);
    
    // Vérifier que le toast est affiché pour la nouvelle notification
    expect(mockToast.toast).toHaveBeenCalledWith({
      title: newNotification.title,
      description: newNotification.message,
    });
  });
  
  it('should unsubscribe when component unmounts', async () => {
    const { unmount } = render(
      <BrowserRouter>
        <EnhancedNotificationCenter />
      </BrowserRouter>
    );
    
    // Démonter le composant
    unmount();
    
    // Vérifier que l'abonnement est annulé
    expect(mockSubscription.unsubscribe).toHaveBeenCalled();
  });
});
