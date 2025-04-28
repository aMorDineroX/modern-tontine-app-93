/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/**
 * Commande personnalisée pour se connecter
 * 
 * @example cy.login('test@example.com', 'password123')
 */
Cypress.Commands.add('login', (email: string, password: string) => {
  // Intercepter les appels à l'API Supabase
  cy.intercept('POST', '**/auth/v1/token*').as('authRequest');
  
  // Visiter la page de connexion
  cy.visit('/login');
  
  // Remplir le formulaire de connexion
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  
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
          email: email,
          user_metadata: {
            full_name: 'Test User',
          },
        },
      };
    }
  });
  
  // Vérifier que l'utilisateur est redirigé vers le tableau de bord
  cy.url().should('include', '/dashboard');
});

/**
 * Commande personnalisée pour simuler un utilisateur connecté
 * 
 * @example cy.loginByAuth()
 */
Cypress.Commands.add('loginByAuth', () => {
  cy.window().then((win) => {
    win.localStorage.setItem('supabase.auth.token', JSON.stringify({
      access_token: 'fake-token',
      refresh_token: 'fake-refresh-token',
      expires_at: Date.now() + 3600000,
    }));
  });
});

/**
 * Commande personnalisée pour créer un groupe
 * 
 * @example cy.createGroup('Famille Tontine', 100, 'monthly')
 */
Cypress.Commands.add('createGroup', (name: string, contribution: number, frequency: string) => {
  // Intercepter les appels à l'API Supabase
  cy.intercept('POST', '**/rest/v1/groups*').as('createGroup');
  cy.intercept('POST', '**/rest/v1/group_members*').as('addGroupMember');
  
  // Visiter la page des groupes
  cy.visit('/groups');
  
  // Cliquer sur le bouton pour créer un nouveau groupe
  cy.contains('button', 'Créer un groupe').click();
  
  // Remplir le formulaire
  cy.get('input[id="name"]').type(name);
  cy.get('input[id="contribution"]').type(contribution.toString());
  cy.get('select[id="frequency"]').select(frequency);
  
  // Soumettre le formulaire
  cy.get('button[type="submit"]').click();
  
  // Attendre la réponse de l'API pour la création du groupe
  cy.wait('@createGroup').then((interception) => {
    // Simuler une réponse réussie
    if (interception.response) {
      interception.response.statusCode = 201;
      interception.response.body = {
        id: 'group-123',
        name: name,
        contribution_amount: contribution,
        frequency: frequency,
        created_at: new Date().toISOString(),
      };
    }
  });
  
  // Attendre la réponse de l'API pour l'ajout du membre
  cy.wait('@addGroupMember').then((interception) => {
    // Simuler une réponse réussie
    if (interception.response) {
      interception.response.statusCode = 201;
      interception.response.body = {
        id: 'member-123',
        group_id: 'group-123',
        user_id: 'user-123',
        role: 'admin',
        status: 'active',
      };
    }
  });
});

/**
 * Commande personnalisée pour basculer le thème
 * 
 * @example cy.toggleTheme()
 */
Cypress.Commands.add('toggleTheme', () => {
  cy.get('button[aria-label="Toggle theme"]').click();
});

// Déclaration des types pour TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      loginByAuth(): Chainable<void>
      createGroup(name: string, contribution: number, frequency: string): Chainable<void>
      toggleTheme(): Chainable<void>
    }
  }
}
