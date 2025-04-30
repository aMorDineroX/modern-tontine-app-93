import React from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Coins } from 'lucide-react';
import { Group } from '@/types/group';
import { useApp } from '@/contexts/AppContext';
import { Badge } from '@/components/ui/badge';

interface CalendarViewProps {
  groups: Group[];
  onGroupClick: (groupId: string | number) => void;
  formatContribution: (amount: number, frequency: string) => string;
}

export default function CalendarView({
  groups,
  onGroupClick,
  formatContribution
}: CalendarViewProps) {
  const { t } = useApp();

  // Fonction pour obtenir la couleur en fonction du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  // Grouper les groupes par date d'échéance
  const groupsByDate = groups.reduce((acc, group) => {
    const date = group.nextDue;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(group);
    return acc;
  }, {} as Record<string, Group[]>);

  // Trier les dates
  const sortedDates = Object.keys(groupsByDate).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('upcomingDueDates')}
        </h3>
      </div>

      <div className="p-4">
        {sortedDates.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-2" />
            <p>{t('noUpcomingDueDates')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map(date => (
              <div key={date} className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                  {date}
                </h4>
                <div className="space-y-3">
                  {groupsByDate[date].map(group => (
                    <motion.div
                      key={group.id}
                      className={`p-3 border rounded-lg cursor-pointer ${getStatusColor(group.status)}`}
                      onClick={() => onGroupClick(group.id)}
                      whileHover={{ y: -2, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{group.name}</h4>
                        <Badge variant="outline">{group.status}</Badge>
                      </div>
                      <div className="flex items-center text-sm">
                        <Coins className="mr-2 h-4 w-4" />
                        <span>{formatContribution(group.contribution, group.frequency)}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
