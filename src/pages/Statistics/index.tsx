import { useState } from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, AreaChart, Area, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
  ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown,
  DollarSign, Users, Calendar, PieChart as PieChartIcon,
  BarChart as BarChartIcon, LineChart as LineChartIcon,
  Download, Filter, RefreshCcw
} from "lucide-react";

// Données pour les statistiques générales
const overviewData = {
  totalContributions: 12500,
  contributionGrowth: 15.8,
  activeGroups: 8,
  groupGrowth: 33.3,
  totalMembers: 42,
  memberGrowth: 10.5,
  completedCycles: 12,
  cycleGrowth: 20.0
};

// Données pour le graphique des contributions mensuelles
const monthlyContributionsData = [
  { name: 'Jan', contributions: 1200, withdrawals: 800, balance: 400 },
  { name: 'Fév', contributions: 1400, withdrawals: 900, balance: 500 },
  { name: 'Mar', contributions: 1000, withdrawals: 700, balance: 300 },
  { name: 'Avr', contributions: 1600, withdrawals: 1100, balance: 500 },
  { name: 'Mai', contributions: 1800, withdrawals: 1200, balance: 600 },
  { name: 'Juin', contributions: 2000, withdrawals: 1300, balance: 700 },
  { name: 'Juil', contributions: 2200, withdrawals: 1400, balance: 800 },
  { name: 'Août', contributions: 1900, withdrawals: 1200, balance: 700 },
  { name: 'Sept', contributions: 2100, withdrawals: 1300, balance: 800 },
  { name: 'Oct', contributions: 2300, withdrawals: 1500, balance: 800 },
  { name: 'Nov', contributions: 2500, withdrawals: 1600, balance: 900 },
  { name: 'Déc', contributions: 2700, withdrawals: 1800, balance: 900 },
];

// Données pour le graphique de répartition des groupes
const groupDistributionData = [
  { name: 'Groupe Familial', value: 35 },
  { name: 'Groupe Amis', value: 25 },
  { name: 'Groupe Collègues', value: 20 },
  { name: 'Groupe Quartier', value: 15 },
  { name: 'Autres', value: 5 },
];

// Données pour le graphique des performances des groupes
const groupPerformanceData = [
  {
    name: 'Groupe A',
    contributions: 95,
    withdrawals: 85,
    growth: 75,
    activity: 90,
  },
  {
    name: 'Groupe B',
    contributions: 80,
    withdrawals: 90,
    growth: 60,
    activity: 85,
  },
  {
    name: 'Groupe C',
    contributions: 70,
    withdrawals: 65,
    growth: 80,
    activity: 75,
  },
  {
    name: 'Groupe D',
    contributions: 85,
    withdrawals: 75,
    growth: 70,
    activity: 80,
  },
];

// Données pour le graphique des contributions par membre
const memberContributionsData = [
  { name: 'Membre 1', contributions: 2500 },
  { name: 'Membre 2', contributions: 2200 },
  { name: 'Membre 3', contributions: 2000 },
  { name: 'Membre 4', contributions: 1800 },
  { name: 'Membre 5', contributions: 1600 },
  { name: 'Membre 6', contributions: 1400 },
  { name: 'Membre 7', contributions: 1200 },
  { name: 'Membre 8', contributions: 1000 },
];

// Couleurs pour les graphiques
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Statistics() {
  const [timeRange, setTimeRange] = useState("year");
  const [groupFilter, setGroupFilter] = useState("all");

  // Fonction pour formater les montants
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <Helmet>
        <title>Statistiques | Naat</title>
      </Helmet>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Statistiques et Rapports</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Analysez les performances de vos tontines et suivez vos progrès
        </p>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="quarter">Ce trimestre</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
              <SelectItem value="all">Tout</SelectItem>
            </SelectContent>
          </Select>

          <Select value={groupFilter} onValueChange={setGroupFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Groupe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les groupes</SelectItem>
              <SelectItem value="group-a">Groupe A</SelectItem>
              <SelectItem value="group-b">Groupe B</SelectItem>
              <SelectItem value="group-c">Groupe C</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2 ml-auto">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <RefreshCcw className="h-4 w-4" />
            Actualiser
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Contributions Totales
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(overviewData.totalContributions)}</div>
            <div className="flex items-center pt-1">
              {overviewData.contributionGrowth > 0 ? (
                <>
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">
                    +{overviewData.contributionGrowth}%
                  </span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-xs text-red-500">
                    {overviewData.contributionGrowth}%
                  </span>
                </>
              )}
              <span className="text-xs text-muted-foreground ml-1">
                depuis le mois dernier
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Groupes Actifs
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewData.activeGroups}</div>
            <div className="flex items-center pt-1">
              {overviewData.groupGrowth > 0 ? (
                <>
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">
                    +{overviewData.groupGrowth}%
                  </span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-xs text-red-500">
                    {overviewData.groupGrowth}%
                  </span>
                </>
              )}
              <span className="text-xs text-muted-foreground ml-1">
                depuis le mois dernier
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Membres Totaux
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewData.totalMembers}</div>
            <div className="flex items-center pt-1">
              {overviewData.memberGrowth > 0 ? (
                <>
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">
                    +{overviewData.memberGrowth}%
                  </span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-xs text-red-500">
                    {overviewData.memberGrowth}%
                  </span>
                </>
              )}
              <span className="text-xs text-muted-foreground ml-1">
                depuis le mois dernier
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Cycles Complétés
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewData.completedCycles}</div>
            <div className="flex items-center pt-1">
              {overviewData.cycleGrowth > 0 ? (
                <>
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">
                    +{overviewData.cycleGrowth}%
                  </span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-xs text-red-500">
                    {overviewData.cycleGrowth}%
                  </span>
                </>
              )}
              <span className="text-xs text-muted-foreground ml-1">
                depuis le mois dernier
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets pour les différentes statistiques */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 mb-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChartIcon className="h-4 w-4" />
            <span>Vue d'ensemble</span>
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            <span>Groupes</span>
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Membres</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>Tendances</span>
          </TabsTrigger>
        </TabsList>

        {/* Onglet Vue d'ensemble */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contributions Mensuelles</CardTitle>
                <CardDescription>
                  Évolution des contributions et retraits sur l'année
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyContributionsData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatAmount(value as number)} />
                      <Legend />
                      <Bar dataKey="contributions" name="Contributions" fill="#0088FE" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="withdrawals" name="Retraits" fill="#FF8042" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Solde Mensuel</CardTitle>
                <CardDescription>
                  Évolution du solde net sur l'année
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyContributionsData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatAmount(value as number)} />
                      <Area type="monotone" dataKey="balance" name="Solde" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Groupes */}
        <TabsContent value="groups">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Répartition des Groupes</CardTitle>
                <CardDescription>
                  Distribution des types de groupes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={groupDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {groupDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance des Groupes</CardTitle>
                <CardDescription>
                  Comparaison des performances par groupe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius={90} data={groupPerformanceData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name="Contributions" dataKey="contributions" stroke="#0088FE" fill="#0088FE" fillOpacity={0.6} />
                      <Radar name="Retraits" dataKey="withdrawals" stroke="#FF8042" fill="#FF8042" fillOpacity={0.6} />
                      <Radar name="Croissance" dataKey="growth" stroke="#00C49F" fill="#00C49F" fillOpacity={0.6} />
                      <Radar name="Activité" dataKey="activity" stroke="#FFBB28" fill="#FFBB28" fillOpacity={0.6} />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Membres */}
        <TabsContent value="members">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contributions par Membre</CardTitle>
                <CardDescription>
                  Top contributeurs dans vos groupes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={memberContributionsData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={100} />
                      <Tooltip formatter={(value) => formatAmount(value as number)} />
                      <Bar dataKey="contributions" name="Contributions" fill="#0088FE" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Tendances */}
        <TabsContent value="trends">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tendances des Contributions</CardTitle>
                <CardDescription>
                  Évolution des contributions sur la période
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyContributionsData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatAmount(value as number)} />
                      <Legend />
                      <Line type="monotone" dataKey="contributions" name="Contributions" stroke="#0088FE" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="withdrawals" name="Retraits" stroke="#FF8042" />
                      <Line type="monotone" dataKey="balance" name="Solde" stroke="#00C49F" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
