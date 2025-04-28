describe('Navigation Flow', () => {
  beforeEach(() => {
    // Simuler un utilisateur connecté
    cy.window().then((win) => {
      win.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'fake-token',
        refresh_token: 'fake-refresh-token',
        expires_at: Date.now() + 3600000,
      }));
    });

    // Intercepter les appels à l'API Supabase
    cy.intercept('GET', '**/rest/v1/profiles*').as('getProfiles');
    cy.intercept('GET', '**/rest/v1/groups*').as('getGroups');
    cy.intercept('GET', '**/rest/v1/transactions*').as('getTransactions');
  });

  it('should navigate between main sections', () => {
    // Visiter le tableau de bord
    cy.visit('/dashboard');

    // Vérifier que le tableau de bord est affiché
    cy.contains('h1', 'Tableau de bord').should('be.visible');

    // Naviguer vers la page des groupes
    cy.get('a[href="/groups"]').click();
    cy.url().should('include', '/groups');
    cy.contains('h1', 'Mes Groupes').should('be.visible');

    // Naviguer vers la page des cycles
    cy.get('a[href="/tontine-cycles"]').click();
    cy.url().should('include', '/tontine-cycles');
    cy.contains('h1', 'Cycles de Tontine').should('be.visible');

    // Naviguer vers la page des transactions
    cy.get('a[href="/transactions"]').click();
    cy.url().should('include', '/transactions');
    cy.contains('h1', 'Transactions').should('be.visible');

    // Naviguer vers la page des statistiques
    cy.get('a[href="/statistics"]').click();
    cy.url().should('include', '/statistics');
    cy.contains('h1', 'Statistiques').should('be.visible');

    // Naviguer vers la page de profil
    cy.get('a[href="/profile"]').click();
    cy.url().should('include', '/profile');
    cy.contains('h1', 'Mon Profil').should('be.visible');
  });

  it('should toggle dark mode', () => {
    // Visiter le tableau de bord
    cy.visit('/dashboard');

    // Vérifier que le mode clair est actif par défaut
    cy.get('html').should('not.have.class', 'dark');

    // Cliquer sur le bouton de basculement du thème
    cy.get('button[aria-label="Toggle theme"]').click();

    // Vérifier que le mode sombre est activé
    cy.get('html').should('have.class', 'dark');

    // Cliquer à nouveau sur le bouton de basculement du thème
    cy.get('button[aria-label="Toggle theme"]').click();

    // Vérifier que le mode clair est réactivé
    cy.get('html').should('not.have.class', 'dark');
  });

  it('should open and close modals', () => {
    // Visiter le tableau de bord
    cy.visit('/dashboard');

    // Ouvrir le modal des paramètres
    cy.get('button[aria-label="Settings"]').click();
    cy.contains('Paramètres').should('be.visible');

    // Fermer le modal
    cy.get('button[aria-label="Close"]').click();
    cy.contains('Paramètres').should('not.exist');

    // Ouvrir le modal de paiement
    cy.contains('button', 'Dépôt / Retrait').click();
    cy.contains('Dépôt / Retrait').should('be.visible');

    // Fermer le modal
    cy.get('button[aria-label="Close"]').click();
    cy.contains('Dépôt / Retrait').should('not.exist');
  });

  it('should toggle mobile menu on small screens', () => {
    // Définir une taille d'écran mobile
    cy.viewport('iphone-x');

    // Visiter le tableau de bord
    cy.visit('/dashboard');

    // Vérifier que le menu mobile est initialement fermé
    cy.contains('a', 'Mes Groupes').should('not.be.visible');

    // Ouvrir le menu mobile
    cy.get('button[aria-label="Open main menu"]').click();

    // Vérifier que le menu mobile est ouvert
    cy.contains('a', 'Mes Groupes').should('be.visible');

    // Naviguer vers la page des groupes
    cy.contains('a', 'Mes Groupes').click();
    cy.url().should('include', '/groups');

    // Vérifier que le menu mobile est fermé après la navigation
    cy.contains('a', 'Transactions').should('not.be.visible');
  });

  it('should search for content', () => {
    // Visiter le tableau de bord
    cy.visit('/dashboard');

    // Ouvrir la recherche
    cy.get('button[aria-label="Search"]').click();

    // Vérifier que la barre de recherche est affichée
    cy.get('input[type="search"]').should('be.visible');

    // Saisir un terme de recherche
    cy.get('input[type="search"]').type('Famille{enter}');

    // Simuler des résultats de recherche
    cy.intercept('GET', '**/rest/v1/groups?name=ilike.*Famille*', {
      statusCode: 200,
      body: [
        {
          id: 'group-123',
          name: 'Famille Tontine',
          contribution_amount: 100,
          frequency: 'monthly',
        },
      ],
    }).as('searchGroups');

    // Vérifier que les résultats de recherche sont affichés
    cy.contains('Famille Tontine').should('be.visible');

    // Fermer la recherche
    cy.get('button[aria-label="Close"]').click();
    cy.get('input[type="search"]').should('not.exist');
  });
});
