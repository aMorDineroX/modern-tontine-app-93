describe('Service Subscription Flow', () => {
  beforeEach(() => {
    // Intercepter les requêtes API
    cy.intercept('GET', '**/services*', { fixture: 'services.json' }).as('getServices');
    cy.intercept('GET', '**/user_services*', { fixture: 'user-services.json' }).as('getUserServices');
    cy.intercept('POST', '**/subscribe_to_service*', { statusCode: 200, body: { id: 123 } }).as('subscribeToService');
    cy.intercept('POST', '**/validate_promo_code*', {
      statusCode: 200,
      body: {
        is_valid: true,
        message: 'Code promotionnel valide',
        discount_type: 'percentage',
        discount_value: 10,
        max_discount_amount: null,
        promo_code_id: 1,
      },
    }).as('validatePromoCode');
    
    // Simuler un utilisateur connecté
    cy.window().then((win) => {
      win.localStorage.setItem('supabase.auth.token', JSON.stringify({
        currentSession: {
          access_token: 'fake-token',
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
          },
        },
      }));
    });
    
    // Visiter la page des services
    cy.visit('/services');
  });
  
  it('should display services list', () => {
    // Attendre que les services soient chargés
    cy.wait('@getServices');
    
    // Vérifier que les services sont affichés
    cy.contains('Premium').should('be.visible');
    cy.contains('Assurance Tontine').should('be.visible');
    cy.contains('Analyse Financière').should('be.visible');
  });
  
  it('should filter services', () => {
    // Attendre que les services soient chargés
    cy.wait('@getServices');
    
    // Rechercher un service
    cy.get('input[placeholder*="Rechercher"]').type('Premium');
    
    // Vérifier que seul le service Premium est affiché
    cy.contains('Premium').should('be.visible');
    cy.contains('Assurance Tontine').should('not.exist');
    
    // Effacer la recherche
    cy.get('input[placeholder*="Rechercher"]').clear();
    
    // Filtrer par catégorie
    cy.get('button').contains('Catégorie').click();
    cy.get('div[role="option"]').contains('Premium').click();
    
    // Vérifier que seul le service Premium est affiché
    cy.contains('Premium').should('be.visible');
    cy.contains('Assurance Tontine').should('not.exist');
  });
  
  it('should open service details', () => {
    // Attendre que les services soient chargés
    cy.wait('@getServices');
    
    // Cliquer sur un service
    cy.contains('Premium').click();
    
    // Vérifier que les détails du service sont affichés
    cy.contains('À propos de Premium').should('be.visible');
    cy.contains('Fonctionnalités principales').should('be.visible');
    
    // Naviguer vers l'onglet Fonctionnalités
    cy.get('button[role="tab"]').contains('Fonctionnalités').click();
    cy.contains('Toutes les fonctionnalités').should('be.visible');
    
    // Naviguer vers l'onglet Tarification
    cy.get('button[role="tab"]').contains('Tarification').click();
    cy.contains('Détails de la tarification').should('be.visible');
  });
  
  it('should apply promo code', () => {
    // Attendre que les services soient chargés
    cy.wait('@getServices');
    
    // Cliquer sur un service
    cy.contains('Premium').click();
    
    // Naviguer vers l'onglet Tarification
    cy.get('button[role="tab"]').contains('Tarification').click();
    
    // Saisir un code promo
    cy.get('input[placeholder*="Saisir un code promotionnel"]').type('TEST10');
    cy.get('button').contains('Appliquer').click();
    
    // Attendre la validation du code promo
    cy.wait('@validatePromoCode');
    
    // Vérifier que le code promo a été appliqué
    cy.contains('Code promotionnel appliqué').should('be.visible');
    cy.contains('Économisez').should('be.visible');
  });
  
  it('should complete subscription flow with PayPal', () => {
    // Attendre que les services soient chargés
    cy.wait('@getServices');
    
    // Cliquer sur un service
    cy.contains('Premium').click();
    
    // Naviguer vers l'onglet Tarification
    cy.get('button[role="tab"]').contains('Tarification').click();
    
    // Sélectionner PayPal comme méthode de paiement
    cy.get('button[role="tab"]').contains('PayPal').click();
    
    // Simuler un clic sur le bouton PayPal
    // Note: Dans un test réel, vous devriez utiliser une sandbox PayPal
    // Ici, nous simulons directement le callback de succès
    cy.window().then((win) => {
      // Simuler un paiement réussi
      const paymentDetails = {
        id: 'test-payment-id',
        status: 'completed',
      };
      
      // Trouver le composant PayPalCheckoutButton et simuler un paiement réussi
      // Note: Ceci est une simplification, dans un test réel vous interagiriez avec l'iframe PayPal
      cy.get('button').contains('Payer avec PayPal').click();
      
      // Attendre l'abonnement au service
      cy.wait('@subscribeToService');
      
      // Vérifier que l'utilisateur est redirigé vers la page des services
      cy.url().should('include', '/services');
      
      // Vérifier que le message de succès est affiché
      cy.contains('Abonnement réussi').should('be.visible');
    });
  });
  
  it('should complete subscription flow with credit card', () => {
    // Attendre que les services soient chargés
    cy.wait('@getServices');
    
    // Cliquer sur un service
    cy.contains('Premium').click();
    
    // Naviguer vers l'onglet Tarification
    cy.get('button[role="tab"]').contains('Tarification').click();
    
    // Sélectionner Carte comme méthode de paiement
    cy.get('button[role="tab"]').contains('Carte').click();
    
    // Remplir le formulaire de carte de crédit
    cy.get('input[placeholder*="1234 5678"]').type('4242 4242 4242 4242');
    cy.get('input[placeholder*="MM/AA"]').type('12/25');
    cy.get('input[placeholder*="123"]').type('123');
    cy.get('input[placeholder*="John Doe"]').type('Test User');
    
    // Cliquer sur le bouton de paiement
    cy.get('button').contains('Payer par carte').click();
    
    // Attendre l'abonnement au service
    cy.wait('@subscribeToService');
    
    // Vérifier que le message de succès est affiché
    cy.contains('Paiement réussi').should('be.visible');
  });
});
