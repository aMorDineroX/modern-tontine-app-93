import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Info, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

export default function RealtimeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useApp();
  
  // Simuler la réception de notifications en temps réel
  useEffect(() => {
    // Notifications initiales
    const initialNotifications: Notification[] = [
      {
        id: '1',
        title: 'Nouveau membre',
        message: 'Alex Smith a rejoint votre groupe "Épargne Famille"',
        type: 'info',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        read: false
      },
      {
        id: '2',
        title: 'Paiement reçu',
        message: 'Vous avez reçu un paiement de 50€ pour le groupe "Investissement"',
        type: 'success',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false
      }
    ];
    
    setNotifications(initialNotifications);
    setUnreadCount(initialNotifications.filter(n => !n.read).length);
    
    // Simuler l'arrivée de nouvelles notifications
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          title: Math.random() > 0.5 ? 'Rappel de paiement' : 'Mise à jour du groupe',
          message: Math.random() > 0.5 
            ? 'Votre paiement pour le groupe "Collègues" est dû dans 2 jours'
            : 'Le statut du groupe "Amis" a été mis à jour',
          type: Math.random() > 0.7 ? 'warning' : Math.random() > 0.4 ? 'info' : 'success',
          timestamp: new Date(),
          read: false
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Afficher un toast pour la nouvelle notification
        toast({
          title: newNotification.title,
          description: newNotification.message,
          variant: newNotification.type === 'error' ? 'destructive' : 'default'
        });
      }
    }, 30000); // Toutes les 30 secondes
    
    return () => clearInterval(interval);
  }, [toast]);
  
  // Marquer une notification comme lue
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
    
    setUnreadCount(prev => Math.max(0, prev - 1));
  };
  
  // Marquer toutes les notifications comme lues
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    
    setUnreadCount(0);
  };
  
  // Supprimer une notification
  const removeNotification = (id: string) => {
    const notification = notifications.find(n => n.id === id);
    
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };
  
  // Obtenir l'icône en fonction du type de notification
  const getNotificationIcon = (type: 'info' | 'success' | 'warning' | 'error') => {
    switch (type) {
      case 'info':
        return <Info size={16} className="text-blue-500" />;
      case 'success':
        return <Check size={16} className="text-green-500" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-yellow-500" />;
      case 'error':
        return <X size={16} className="text-red-500" />;
      default:
        return <Info size={16} className="text-blue-500" />;
    }
  };
  
  // Formater la date
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) {
      return t('justNow');
    } else if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? t('minuteAgo') : t('minutesAgo')}`;
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return `${hours} ${hours === 1 ? t('hourAgo') : t('hoursAgo')}`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  return (
    <div className="relative">
      {/* Bouton de notification */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} className="text-gray-700 dark:text-gray-300" />
        
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {/* Panneau de notifications */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* En-tête */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
                <Bell size={16} className="mr-2" />
                {t('notifications')}
                {unreadCount > 0 && (
                  <span className="ml-2 text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 px-1.5 py-0.5 rounded-full">
                    {unreadCount} {t('new')}
                  </span>
                )}
              </h3>
              
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  {t('markAllAsRead')}
                </button>
              )}
            </div>
            
            {/* Liste des notifications */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  <Bell size={24} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                  <p>{t('noNotifications')}</p>
                </div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {notification.title}
                          </p>
                          
                          <div className="flex items-center ml-2">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                aria-label="Marquer comme lu"
                                title="Marquer comme lu"
                              >
                                <Check size={14} />
                              </button>
                            )}
                            
                            <button
                              onClick={() => removeNotification(notification.id)}
                              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              aria-label="Supprimer"
                              title="Supprimer"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {formatDate(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Pied de page */}
            <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                {t('close')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
