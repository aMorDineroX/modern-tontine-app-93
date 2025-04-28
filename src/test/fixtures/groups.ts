/**
 * Fixtures pour les tests des groupes de tontine
 * 
 * Ce fichier contient des données de test pour les groupes de tontine.
 */

/**
 * Groupes de tontine de test
 */
export const mockGroups = [
  {
    id: 1,
    name: 'Test Group 1',
    members: 5,
    contribution: 100,
    frequency: 'monthly',
    nextDue: '2023-12-31',
    status: 'active',
    progress: 75,
  },
  {
    id: 2,
    name: 'Test Group 2',
    members: 8,
    contribution: 50,
    frequency: 'weekly',
    nextDue: '2023-12-24',
    status: 'pending',
    progress: 25,
  },
  {
    id: 3,
    name: 'Test Group 3',
    members: 12,
    contribution: 200,
    frequency: 'monthly',
    nextDue: '2024-01-15',
    status: 'completed',
    progress: 100,
  },
];

/**
 * Membres de test
 */
export const mockMembers = [
  { id: 1, name: "Nia Johnson", status: "active" },
  { id: 2, name: "Kwame Brown", status: "active" },
  { id: 3, name: "Zainab Ali", status: "pending" },
  { id: 4, name: "Jamal Wilson", status: "active" },
  { id: 5, name: "Fatima Hassan", status: "active" },
];

/**
 * Contributions de test
 */
export const mockContributions = [
  {
    id: 1,
    groupId: 1,
    userId: 1,
    amount: 100,
    date: '2023-11-30',
    status: 'completed',
  },
  {
    id: 2,
    groupId: 1,
    userId: 2,
    amount: 100,
    date: '2023-11-30',
    status: 'completed',
  },
  {
    id: 3,
    groupId: 1,
    userId: 3,
    amount: 100,
    date: '2023-11-30',
    status: 'pending',
  },
];
