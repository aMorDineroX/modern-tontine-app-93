describe('Create Group Flow', () => {
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
    cy.intercept('POST', '**/rest/v1/groups*').as('createGroup');
    cy.intercept('POST', '**/rest/v1/group_members*').as('addGroupMember');
  });

  it('should allow a user to create a new group', () => {
    // Visiter la page des groupes
    cy.visit('/groups');

    // Cliquer sur le bouton pour créer un nouveau groupe
    cy.contains('button', 'Créer un groupe').click();

    // Vérifier que le modal est ouvert
    cy.contains('Créer un groupe').should('be.visible');

    // Remplir le formulaire
    cy.get('input[id="name"]').type('Famille Tontine');
    cy.get('input[id="contribution"]').type('100');
    cy.get('select[id="frequency"]').select('monthly');
    cy.get('input[id="startDate"]').type('2023-01-01');
    cy.get('select[id="payoutMethod"]').select('rotation');
    cy.get('textarea[id="members"]').type('ami1@example.com, ami2@example.com');

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click();

    // Attendre la réponse de l'API pour la création du groupe
    cy.wait('@createGroup').then((interception) => {
      // Simuler une réponse réussie
      if (interception.response) {
        interception.response.statusCode = 201;
        interception.response.body = {
          id: 'group-123',
          name: 'Famille Tontine',
          contribution_amount: 100,
          frequency: 'monthly',
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

    // Vérifier que le message de succès est affiché
    cy.contains('Groupe créé avec succès').should('be.visible');

    // Vérifier que le nouveau groupe apparaît dans la liste
    cy.contains('Famille Tontine').should('be.visible');
  });

  it('should display validation errors for invalid inputs', () => {
    // Visiter la page des groupes
    cy.visit('/groups');

    // Cliquer sur le bouton pour créer un nouveau groupe
    cy.contains('button', 'Créer un groupe').click();

    // Soumettre le formulaire sans remplir les champs obligatoires
    cy.get('button[type="submit"]').click();

    // Vérifier que les messages d'erreur sont affichés
    cy.contains('Le nom du groupe est requis').should('be.visible');
    cy.contains('Le montant de contribution est requis').should('be.visible');
  });

  it('should handle API errors during group creation', () => {
    // Visiter la page des groupes
    cy.visit('/groups');

    // Cliquer sur le bouton pour créer un nouveau groupe
    cy.contains('button', 'Créer un groupe').click();

    // Remplir le formulaire
    cy.get('input[id="name"]').type('Famille Tontine');
    cy.get('input[id="contribution"]').type('100');

    // Intercepter la requête de création de groupe et simuler une erreur
    cy.intercept('POST', '**/rest/v1/groups*', {
      statusCode: 500,
      body: {
        error: 'Internal Server Error',
        message: 'Une erreur est survenue lors de la création du groupe',
      },
    }).as('createGroupError');

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click();

    // Attendre la réponse de l'API
    cy.wait('@createGroupError');

    // Vérifier que le message d'erreur est affiché
    cy.contains('Une erreur est survenue lors de la création du groupe').should('be.visible');
  });
});
