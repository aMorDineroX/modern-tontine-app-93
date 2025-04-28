describe('Authentication Flow', () => {
  beforeEach(() => {
    // Intercepter les appels à l'API Supabase
    cy.intercept('POST', '**/auth/v1/token*').as('authRequest');
    cy.intercept('GET', '**/auth/v1/user*').as('userRequest');
  });

  it('should allow a user to sign in', () => {
    // Visiter la page de connexion
    cy.visit('/login');

    // Remplir le formulaire de connexion
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click();

    // Attendre la réponse de l'API
    cy.wait('@authRequest').then((interception) => {
      // Simuler une réponse réussie
      if (interception.response) {
        interception.response.statusCode = 200;
        interception.response.body = {
          access_token: 'fake-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'fake-refresh-token',
          user: {
            id: 'user-123',
            email: 'test@example.com',
            user_metadata: {
              full_name: 'Test User',
            },
          },
        };
      }
    });

    // Vérifier que l'utilisateur est redirigé vers le tableau de bord
    cy.url().should('include', '/dashboard');

    // Vérifier que le nom de l'utilisateur est affiché
    cy.contains('Test User').should('be.visible');
  });

  it('should allow a user to sign up', () => {
    // Visiter la page d'inscription
    cy.visit('/signup');

    // Remplir le formulaire d'inscription
    cy.get('input[name="fullName"]').type('New User');
    cy.get('input[type="email"]').type('new@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('password123');

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click();

    // Attendre la réponse de l'API
    cy.wait('@authRequest').then((interception) => {
      // Simuler une réponse réussie
      if (interception.response) {
        interception.response.statusCode = 200;
        interception.response.body = {
          user: {
            id: 'user-456',
            email: 'new@example.com',
            user_metadata: {
              full_name: 'New User',
            },
          },
          session: null,
        };
      }
    });

    // Vérifier que le message de confirmation est affiché
    cy.contains('Veuillez vérifier votre email').should('be.visible');
  });

  it('should allow a user to reset password', () => {
    // Visiter la page de réinitialisation de mot de passe
    cy.visit('/forgot-password');

    // Remplir le formulaire
    cy.get('input[type="email"]').type('test@example.com');

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click();

    // Attendre la réponse de l'API
    cy.wait('@authRequest').then((interception) => {
      // Simuler une réponse réussie
      if (interception.response) {
        interception.response.statusCode = 200;
        interception.response.body = {};
      }
    });

    // Vérifier que le message de confirmation est affiché
    cy.contains('Email de réinitialisation envoyé').should('be.visible');
  });

  it('should allow a user to sign out', () => {
    // Simuler un utilisateur connecté
    cy.window().then((win) => {
      win.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'fake-token',
        refresh_token: 'fake-refresh-token',
        expires_at: Date.now() + 3600000,
      }));
    });

    // Visiter le tableau de bord
    cy.visit('/dashboard');

    // Intercepter la requête de déconnexion
    cy.intercept('POST', '**/auth/v1/logout*').as('logoutRequest');

    // Cliquer sur le bouton de déconnexion
    cy.get('button[aria-label="Sign out"]').click();

    // Attendre la réponse de l'API
    cy.wait('@logoutRequest').then((interception) => {
      // Simuler une réponse réussie
      if (interception.response) {
        interception.response.statusCode = 200;
        interception.response.body = {};
      }
    });

    // Vérifier que l'utilisateur est redirigé vers la page de connexion
    cy.url().should('include', '/login');
  });
});
