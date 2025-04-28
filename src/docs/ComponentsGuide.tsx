/**
 * Guide des composants - Documentation interactive des composants de l'application
 *
 * Ce fichier fournit une documentation complète et interactive des composants
 * utilisés dans l'application Naat. Il permet aux développeurs de comprendre
 * comment utiliser chaque composant, quelles sont ses propriétés, et comment
 * il se comporte visuellement.
 *
 * @module docs/ComponentsGuide
 */

import { useState } from 'react';
import TontineGroup from '@/components/TontineGroup';
import MemberList from '@/components/MemberList';
import ContributionCard from '@/components/ContributionCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ErrorBoundary from '@/components/ErrorBoundary';
import SkipToContent from '@/components/SkipToContent';

/**
 * Composant principal du guide des composants
 *
 * @component
 * @returns {JSX.Element} Le guide des composants
 */
export default function ComponentsGuide() {
  const [activeTab, setActiveTab] = useState('tontineGroup');

  // Données de démonstration
  const mockMembers = [
    { id: 1, name: "Nia Johnson", status: "active" as const },
    { id: 2, name: "Kwame Brown", status: "active" as const },
    { id: 3, name: "Zainab Ali", status: "pending" as const },
  ];

  return (
    <div className="max-w-7xl mx-auto p-8">
      <SkipToContent contentId="components-content" />

      <h1 className="text-3xl font-bold mb-8">Guide des composants Naat</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="tontineGroup">TontineGroup</TabsTrigger>
          <TabsTrigger value="memberList">MemberList</TabsTrigger>
          <TabsTrigger value="contributionCard">ContributionCard</TabsTrigger>
          <TabsTrigger value="errorBoundary">ErrorBoundary</TabsTrigger>
        </TabsList>

        <div id="components-content" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <TabsContent value="tontineGroup">
            <ComponentSection
              title="TontineGroup"
              description="Composant pour afficher un groupe de tontine sous forme de carte."
              props={[
                { name: 'name', type: 'string', required: true, description: 'Nom du groupe de tontine' },
                { name: 'members', type: 'number', required: true, description: 'Nombre de membres dans le groupe' },
                { name: 'contribution', type: 'string', required: true, description: 'Montant et fréquence de contribution (formaté)' },
                { name: 'nextDue', type: 'string', required: true, description: 'Date de la prochaine échéance' },
                { name: 'status', type: "'active' | 'pending' | 'completed'", required: false, description: 'Statut du groupe' },
                { name: 'progress', type: 'number', required: false, description: 'Progression du cycle actuel (0-100)' },
                { name: 'onClick', type: 'function', required: true, description: 'Fonction appelée lors du clic sur la carte' },
                { name: 'actions', type: 'Array<{ icon, label, onClick }>', required: false, description: 'Actions supplémentaires' },
              ]}
            >
              <div className="max-w-md mx-auto">
                <TontineGroup
                  name="Exemple de groupe"
                  members={5}
                  contribution="100€ / mensuel"
                  nextDue="31 déc 2023"
                  status="active"
                  progress={75}
                  onClick={() => alert('Groupe cliqué')}
                />
              </div>
            </ComponentSection>
          </TabsContent>

          <TabsContent value="memberList">
            <ComponentSection
              title="MemberList"
              description="Composant pour afficher une liste de membres."
              props={[
                { name: 'members', type: 'Array<{ id, name, status }>', required: true, description: 'Liste des membres' },
                { name: 'title', type: 'string', required: false, description: 'Titre de la liste' },
                { name: 'maxDisplay', type: 'number', required: false, description: 'Nombre maximum de membres à afficher' },
                { name: 'compact', type: 'boolean', required: false, description: 'Affichage compact' },
                { name: 'showShareButton', type: 'boolean', required: false, description: 'Afficher le bouton de partage' },
              ]}
            >
              <div className="max-w-md mx-auto">
                <MemberList
                  title="Membres récents"
                  members={mockMembers}
                  maxDisplay={3}
                  compact={true}
                  showShareButton={false}
                />
              </div>
            </ComponentSection>
          </TabsContent>

          <TabsContent value="contributionCard">
            <ComponentSection
              title="ContributionCard"
              description="Composant pour afficher une carte de contribution."
              props={[
                { name: 'title', type: 'string', required: true, description: 'Titre de la carte' },
                { name: 'amount', type: 'string', required: true, description: 'Montant formaté' },
                { name: 'trend', type: 'string', required: false, description: 'Tendance (ex: "Up 8% from last month")' },
                { name: 'icon', type: "'contribution' | 'balance' | 'custom'", required: false, description: 'Icône à afficher' },
                { name: 'customIcon', type: 'ReactNode', required: false, description: 'Icône personnalisée' },
              ]}
            >
              <div className="max-w-md mx-auto">
                <ContributionCard
                  title="Contributions totales"
                  amount="1250€"
                  trend="Up 8% from last month"
                  icon="contribution"
                />
              </div>
            </ComponentSection>
          </TabsContent>

          <TabsContent value="errorBoundary">
            <ComponentSection
              title="ErrorBoundary"
              description="Composant pour capturer les erreurs dans les composants enfants."
              props={[
                { name: 'children', type: 'ReactNode', required: true, description: 'Composants enfants' },
                { name: 'fallback', type: 'ReactNode', required: false, description: 'Composant à afficher en cas d\'erreur' },
                { name: 'onError', type: 'function', required: false, description: 'Fonction appelée lorsqu\'une erreur est capturée' },
              ]}
            >
              <div className="max-w-md mx-auto">
                <ErrorBoundary
                  fallback={
                    <div className="p-4 bg-red-100 text-red-700 rounded-md">
                      Une erreur s'est produite dans le composant.
                    </div>
                  }
                >
                  <div className="p-4 bg-green-100 text-green-700 rounded-md">
                    Ce composant est encapsulé dans un ErrorBoundary.
                  </div>
                </ErrorBoundary>
              </div>
            </ComponentSection>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

/**
 * Interface des propriétés du composant ComponentSection
 */
interface ComponentSectionProps {
  /** Titre de la section */
  title: string;
  /** Description du composant */
  description: string;
  /** Liste des propriétés du composant */
  props: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  /** Exemple du composant */
  children: React.ReactNode;
}

/**
 * Composant ComponentSection - Section de documentation d'un composant
 *
 * @component
 * @param {ComponentSectionProps} props - Propriétés du composant
 * @returns {JSX.Element} Section de documentation
 */
const ComponentSection: React.FC<ComponentSectionProps> = ({
  title,
  description,
  props,
  children
}) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="mb-6 text-gray-600 dark:text-gray-400">{description}</p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Exemple</CardTitle>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>

      <h3 className="text-lg font-medium mb-2">Props</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="border p-2 text-left">Prop</th>
              <th className="border p-2 text-left">Type</th>
              <th className="border p-2 text-left">Requis</th>
              <th className="border p-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            {props.map((prop) => (
              <tr key={prop.name} className="border-b dark:border-gray-600">
                <td className="border p-2 font-mono text-sm">{prop.name}</td>
                <td className="border p-2 font-mono text-sm">{prop.type}</td>
                <td className="border p-2">{prop.required ? 'Oui' : 'Non'}</td>
                <td className="border p-2">{prop.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};