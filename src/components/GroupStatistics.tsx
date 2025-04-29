import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Group } from '@/types/group';
import { useApp } from '@/contexts/AppContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface GroupStatisticsProps {
  groups: Group[];
  className?: string;
}

export default function GroupStatistics({ groups, className = '' }: GroupStatisticsProps) {
  const { t, formatAmount } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Couleurs pour les graphiques
  const COLORS = ['#4ade80', '#facc15', '#60a5fa', '#f87171', '#a78bfa'];
  
  // Données pour le graphique en barres (contribution par groupe)
  const contributionData = groups
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 5)
    .map(group => ({
      name: group.name.length > 10 ? group.name.substring(0, 10) + '...' : group.name,
      contribution: group.contribution
    }));
  
  // Données pour le graphique circulaire (répartition par statut)
  const statusData = [
    { name: t('active'), value: groups.filter(g => g.status === 'active').length },
    { name: t('pending'), value: groups.filter(g => g.status === 'pending').length },
    { name: t('completed'), value: groups.filter(g => g.status === 'completed').length }
  ].filter(item => item.value > 0);
  
  // Données pour le graphique en barres (membres par groupe)
  const membersData = groups
    .sort((a, b) => b.members - a.members)
    .slice(0, 5)
    .map(group => ({
      name: group.name.length > 10 ? group.name.substring(0, 10) + '...' : group.name,
      members: group.members
    }));
  
  // Calculer les statistiques générales
  const totalContribution = groups.reduce((acc, group) => acc + group.contribution, 0);
  const avgContribution = totalContribution / (groups.length || 1);
  const maxContribution = Math.max(...groups.map(g => g.contribution));
  const minContribution = Math.min(...groups.map(g => g.contribution));
  const totalMembers = groups.reduce((acc, group) => acc + group.members, 0);
  const avgMembers = totalMembers / (groups.length || 1);
  
  // Formater les nombres
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(Math.round(num * 100) / 100);
  };
  
  // Personnaliser le tooltip du graphique
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow-sm">
          <p className="text-sm font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'contribution' ? formatAmount(entry.value) : formatNumber(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('advancedStatistics')}</h3>
      
      <Tabs defaultValue="overview" onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
          <TabsTrigger value="contributions">{t('contributions')}</TabsTrigger>
          <TabsTrigger value="members">{t('members')}</TabsTrigger>
          <TabsTrigger value="status">{t('status')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('totalGroups')}</p>
              <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
                {groups.length}
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('totalMembers')}</p>
              <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                {formatNumber(totalMembers)}
              </p>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('avgContribution')}</p>
              <p className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">
                {formatAmount(avgContribution)}
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('avgMembers')}</p>
              <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400">
                {formatNumber(avgMembers)}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('topContributions')}</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={contributionData} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" strokeOpacity={0.3} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(value) => formatAmount(value)} tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="contribution" fill="#4ade80" name="contribution" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('statusDistribution')}</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="contributions" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('totalContributions')}</p>
              <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
                {formatAmount(totalContribution)}
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('maxContribution')}</p>
              <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                {formatAmount(maxContribution)}
              </p>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('minContribution')}</p>
              <p className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">
                {formatAmount(minContribution)}
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg mt-4">
            <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('contributionByGroup')}</h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={contributionData} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" strokeOpacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(value) => formatAmount(value)} tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="contribution" fill="#4ade80" name="contribution" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="members" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('totalMembers')}</p>
              <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
                {formatNumber(totalMembers)}
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('avgMembers')}</p>
              <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                {formatNumber(avgMembers)}
              </p>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('maxMembers')}</p>
              <p className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">
                {Math.max(...groups.map(g => g.members))}
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg mt-4">
            <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('membersByGroup')}</h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={membersData} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" strokeOpacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="members" fill="#60a5fa" name="members" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="status" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('activeGroups')}</p>
              <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
                {groups.filter(g => g.status === 'active').length}
              </p>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('pendingGroups')}</p>
              <p className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">
                {groups.filter(g => g.status === 'pending').length}
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('completedGroups')}</p>
              <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                {groups.filter(g => g.status === 'completed').length}
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg mt-4">
            <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('statusDistribution')}</h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
