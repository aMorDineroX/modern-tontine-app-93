import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EnhancedPaymentSystem from '../components/EnhancedPaymentSystem';
import { useToast } from '../hooks/use-toast';

// Mock des hooks
vi.mock('../hooks/use-toast', () => ({
  useToast: vi.fn()
}));

describe('EnhancedPaymentSystem', () => {
  const mockToast = { toast: vi.fn() };
  const mockOnPaymentComplete = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock des hooks
    (useToast as any).mockReturnValue(mockToast);
    
    // Mock de setTimeout
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.useRealTimers();
  });
  
  it('should render the payment system', () => {
    render(
      <EnhancedPaymentSystem 
        onPaymentComplete={mockOnPaymentComplete} 
        amount={99.99} 
        currency="EUR" 
      />
    );
    
    // Vérifier que le titre est affiché
    expect(screen.getByText('Paiement')).toBeInTheDocument();
    
    // Vérifier que les onglets sont affichés
    expect(screen.getByText('Carte')).toBeInTheDocument();
    expect(screen.getByText('PayPal')).toBeInTheDocument();
    expect(screen.getByText('Virement')).toBeInTheDocument();
    
    // Vérifier que le montant est affiché
    expect(screen.getByText('99.99 EUR')).toBeInTheDocument();
    
    // Vérifier que le bouton de paiement est affiché
    expect(screen.getByText('Payer maintenant')).toBeInTheDocument();
  });
  
  it('should switch between payment methods', () => {
    render(
      <EnhancedPaymentSystem 
        onPaymentComplete={mockOnPaymentComplete} 
        amount={99.99} 
        currency="EUR" 
      />
    );
    
    // Vérifier que l'onglet "Carte" est actif par défaut
    expect(screen.getByLabelText('Numéro de carte')).toBeInTheDocument();
    
    // Cliquer sur l'onglet "PayPal"
    fireEvent.click(screen.getByText('PayPal'));
    
    // Vérifier que le contenu de PayPal est affiché
    expect(screen.getByText('Vous serez redirigé vers PayPal pour finaliser votre paiement.')).toBeInTheDocument();
    
    // Cliquer sur l'onglet "Virement"
    fireEvent.click(screen.getByText('Virement'));
    
    // Vérifier que le contenu de Virement est affiché
    expect(screen.getByText('Coordonnées bancaires')).toBeInTheDocument();
    expect(screen.getByText(/IBAN: FR76/)).toBeInTheDocument();
  });
  
  it('should validate card inputs', async () => {
    render(
      <EnhancedPaymentSystem 
        onPaymentComplete={mockOnPaymentComplete} 
        amount={99.99} 
        currency="EUR" 
      />
    );
    
    // Cliquer sur le bouton de paiement sans remplir les champs
    fireEvent.click(screen.getByText('Payer maintenant'));
    
    // Vérifier que le toast d'erreur est affiché
    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: "Erreur de paiement",
        description: "Veuillez remplir tous les champs de la carte",
        variant: "destructive",
      });
    });
    
    // Remplir les champs avec des valeurs invalides
    fireEvent.change(screen.getByLabelText('Nom sur la carte'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Numéro de carte'), { target: { value: '1234' } });
    fireEvent.change(screen.getByLabelText('Date d\'expiration'), { target: { value: '12' } });
    fireEvent.change(screen.getByLabelText('CVC'), { target: { value: '12' } });
    
    // Cliquer sur le bouton de paiement
    fireEvent.click(screen.getByText('Payer maintenant'));
    
    // Vérifier que le toast d'erreur est affiché pour le numéro de carte
    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: "Erreur de paiement",
        description: "Le numéro de carte doit comporter 16 chiffres",
        variant: "destructive",
      });
    });
    
    // Corriger le numéro de carte mais garder une date d'expiration invalide
    fireEvent.change(screen.getByLabelText('Numéro de carte'), { target: { value: '1234 5678 9012 3456' } });
    
    // Cliquer sur le bouton de paiement
    fireEvent.click(screen.getByText('Payer maintenant'));
    
    // Vérifier que le toast d'erreur est affiché pour la date d'expiration
    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: "Erreur de paiement",
        description: "La date d'expiration doit être au format MM/AA",
        variant: "destructive",
      });
    });
    
    // Corriger la date d'expiration mais garder un CVC invalide
    fireEvent.change(screen.getByLabelText('Date d\'expiration'), { target: { value: '12/25' } });
    
    // Cliquer sur le bouton de paiement
    fireEvent.click(screen.getByText('Payer maintenant'));
    
    // Vérifier que le toast d'erreur est affiché pour le CVC
    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: "Erreur de paiement",
        description: "Le code CVC doit comporter 3 chiffres",
        variant: "destructive",
      });
    });
  });
  
  it('should process payment successfully', async () => {
    render(
      <EnhancedPaymentSystem 
        onPaymentComplete={mockOnPaymentComplete} 
        amount={99.99} 
        currency="EUR" 
      />
    );
    
    // Remplir tous les champs correctement
    fireEvent.change(screen.getByLabelText('Nom sur la carte'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Numéro de carte'), { target: { value: '1234 5678 9012 3456' } });
    fireEvent.change(screen.getByLabelText('Date d\'expiration'), { target: { value: '12/25' } });
    fireEvent.change(screen.getByLabelText('CVC'), { target: { value: '123' } });
    
    // Cliquer sur le bouton de paiement
    fireEvent.click(screen.getByText('Payer maintenant'));
    
    // Vérifier que le bouton est désactivé pendant le traitement
    expect(screen.getByText('Traitement...')).toBeInTheDocument();
    
    // Avancer le temps pour simuler le traitement
    vi.advanceTimersByTime(2000);
    
    // Vérifier que le toast de succès est affiché
    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: "Paiement réussi",
        description: "Votre paiement de 99.99 EUR a été traité avec succès.",
      });
    });
    
    // Vérifier que l'écran de confirmation est affiché
    await waitFor(() => {
      expect(screen.getByText('Paiement réussi')).toBeInTheDocument();
      expect(screen.getByText('Votre paiement de 99.99 EUR a été traité avec succès.')).toBeInTheDocument();
    });
    
    // Avancer le temps pour le callback
    vi.advanceTimersByTime(1500);
    
    // Vérifier que le callback est appelé
    expect(mockOnPaymentComplete).toHaveBeenCalledWith(expect.stringMatching(/PAY-\d+-\d+/));
  });
  
  it('should format card inputs correctly', () => {
    render(
      <EnhancedPaymentSystem 
        onPaymentComplete={mockOnPaymentComplete} 
        amount={99.99} 
        currency="EUR" 
      />
    );
    
    // Tester le formatage du numéro de carte
    const cardNumberInput = screen.getByLabelText('Numéro de carte');
    fireEvent.change(cardNumberInput, { target: { value: '1234567890123456' } });
    expect(cardNumberInput).toHaveValue('1234 5678 9012 3456');
    
    // Tester le formatage de la date d'expiration
    const expiryInput = screen.getByLabelText('Date d\'expiration');
    fireEvent.change(expiryInput, { target: { value: '1225' } });
    expect(expiryInput).toHaveValue('12/25');
    
    // Tester le formatage du CVC (doit accepter uniquement des chiffres)
    const cvcInput = screen.getByLabelText('CVC');
    fireEvent.change(cvcInput, { target: { value: 'abc123' } });
    expect(cvcInput).toHaveValue('123');
  });
  
  it('should display custom description if provided', () => {
    const description = "Paiement pour l'abonnement Premium";
    
    render(
      <EnhancedPaymentSystem 
        onPaymentComplete={mockOnPaymentComplete} 
        amount={99.99} 
        currency="EUR"
        description={description}
      />
    );
    
    // Vérifier que la description est affichée
    expect(screen.getByText(description)).toBeInTheDocument();
  });
});
