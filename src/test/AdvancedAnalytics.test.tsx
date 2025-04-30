import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdvancedAnalytics from '../components/AdvancedAnalytics';

// Mock de recharts
vi.mock('recharts', () => {
  const OriginalModule = vi.importActual('recharts');
  
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    BarChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="bar-chart">{children}</div>
    ),
    LineChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="line-chart">{children}</div>
    ),
    AreaChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="area-chart">{children}</div>
    ),
    PieChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="pie-chart">{children}</div>
    ),
    Bar: () => <div data-testid="bar" />,
    Line: () => <div data-testid="line" />,
    Area: () => <div data-testid="area" />,
    Pie: () => <div data-testid="pie" />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />,
    Cell: () => <div data-testid="cell" />
  };
});

describe('AdvancedAnalytics', () => {
  const mockData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Apr', value: 800 },
    { name: 'May', value: 500 }
  ];
  
  const mockTitle = 'Test Analytics';
  const mockDescription = 'Test Description';
  const mockOnRefresh = vi.fn();
  const mockOnDownload = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should render the analytics component', () => {
    render(
      <AdvancedAnalytics 
        data={mockData}
        title={mockTitle}
        description={mockDescription}
      />
    );
    
    // Vérifier que le titre et la description sont affichés
    expect(screen.getByText(mockTitle)).toBeInTheDocument();
    expect(screen.getByText(mockDescription)).toBeInTheDocument();
    
    // Vérifier que les onglets sont affichés
    expect(screen.getByText('Barres')).toBeInTheDocument();
    expect(screen.getByText('Ligne')).toBeInTheDocument();
    expect(screen.getByText('Aire')).toBeInTheDocument();
    expect(screen.getByText('Camembert')).toBeInTheDocument();
    
    // Vérifier que le sélecteur de période est affiché
    expect(screen.getByText('Période')).toBeInTheDocument();
    
    // Vérifier que le graphique est affiché (par défaut: bar chart)
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });
  
  it('should switch between chart types', () => {
    render(
      <AdvancedAnalytics 
        data={mockData}
        title={mockTitle}
      />
    );
    
    // Vérifier que le bar chart est affiché par défaut
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    
    // Cliquer sur l'onglet "Ligne"
    fireEvent.click(screen.getByText('Ligne'));
    
    // Vérifier que le line chart est affiché
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    
    // Cliquer sur l'onglet "Aire"
    fireEvent.click(screen.getByText('Aire'));
    
    // Vérifier que le area chart est affiché
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    
    // Cliquer sur l'onglet "Camembert"
    fireEvent.click(screen.getByText('Camembert'));
    
    // Vérifier que le pie chart est affiché
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });
  
  it('should change time range', async () => {
    render(
      <AdvancedAnalytics 
        data={mockData}
        title={mockTitle}
      />
    );
    
    // Ouvrir le sélecteur de période
    fireEvent.click(screen.getByText('Période'));
    
    // Sélectionner "Semaine"
    fireEvent.click(screen.getByText('Semaine'));
    
    // Vérifier que la période a changé
    await waitFor(() => {
      expect(screen.getByText('Semaine')).toBeInTheDocument();
    });
    
    // Ouvrir à nouveau le sélecteur
    fireEvent.click(screen.getByText('Semaine'));
    
    // Sélectionner "Année"
    fireEvent.click(screen.getByText('Année'));
    
    // Vérifier que la période a changé
    await waitFor(() => {
      expect(screen.getByText('Année')).toBeInTheDocument();
    });
  });
  
  it('should call refresh and download callbacks', () => {
    render(
      <AdvancedAnalytics 
        data={mockData}
        title={mockTitle}
        onRefresh={mockOnRefresh}
        onDownload={mockOnDownload}
      />
    );
    
    // Vérifier que les boutons sont affichés
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    const downloadButton = screen.getByRole('button', { name: /download/i });
    
    expect(refreshButton).toBeInTheDocument();
    expect(downloadButton).toBeInTheDocument();
    
    // Cliquer sur le bouton de rafraîchissement
    fireEvent.click(refreshButton);
    
    // Vérifier que le callback est appelé
    expect(mockOnRefresh).toHaveBeenCalledTimes(1);
    
    // Cliquer sur le bouton de téléchargement
    fireEvent.click(downloadButton);
    
    // Vérifier que le callback est appelé
    expect(mockOnDownload).toHaveBeenCalledTimes(1);
  });
  
  it('should display loading state', () => {
    render(
      <AdvancedAnalytics 
        data={mockData}
        title={mockTitle}
        isLoading={true}
      />
    );
    
    // Vérifier que l'indicateur de chargement est affiché
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // Vérifier que le graphique n'est pas affiché
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
  });
  
  it('should display empty state when no data', () => {
    render(
      <AdvancedAnalytics 
        data={[]}
        title={mockTitle}
      />
    );
    
    // Vérifier que le message d'absence de données est affiché
    expect(screen.getByText('Aucune donnée disponible')).toBeInTheDocument();
    expect(screen.getByText('Essayez de modifier les filtres ou la période')).toBeInTheDocument();
    
    // Vérifier que le graphique n'est pas affiché
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
  });
  
  it('should use custom data keys if provided', () => {
    const customData = [
      { category: 'A', amount: 100 },
      { category: 'B', amount: 200 }
    ];
    
    render(
      <AdvancedAnalytics 
        data={customData}
        title={mockTitle}
        dataKey="amount"
        nameKey="category"
      />
    );
    
    // Vérifier que le graphique est affiché
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });
  
  it('should display last update time', () => {
    // Mock de Date.now() pour avoir une date constante
    const mockDate = new Date('2023-07-01T12:00:00Z');
    vi.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
    
    render(
      <AdvancedAnalytics 
        data={mockData}
        title={mockTitle}
      />
    );
    
    // Vérifier que la date de dernière mise à jour est affichée
    expect(screen.getByText(/Dernière mise à jour:/)).toBeInTheDocument();
    
    // Restaurer Date
    vi.restoreAllMocks();
  });
});
