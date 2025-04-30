import React from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';

interface NotificationCenterProps {
  onClose: () => void;
}

export default function NotificationCenter({ onClose }: NotificationCenterProps) {
  const { t } = useApp();
  
  // Exemple de notifications
  const notifications = [
    {
      id: 1,
      title: 'Paiement reçu',
      message: 'Vous avez reçu un paiement de 100€ pour le groupe Famille',
      date: '2023-05-15T10:30:00',
      read: false
    },
    {
      id: 2,
      title: 'Échéance à venir',
      message: 'Rappel: Échéance du groupe Amis dans 3 jours',
      date: '2023-05-14T14:45:00',
      read: true
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden w-full max-w-md">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold flex items-center">
          <Bell className="mr-2 h-5 w-5 text-primary" />
          {t('notifications')}
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            <Bell className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-2" />
            <p>{t('noNotifications')}</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.map(notification => (
              <li 
                key={notification.id} 
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="flex justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {notification.title}
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(notification.date).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {notification.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex justify-between">
        <Button variant="outline" size="sm">
          {t('markAllAsRead')}
        </Button>
        <Button variant="outline" size="sm">
          {t('clearAll')}
        </Button>
      </div>
    </div>
  );
}
