import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Bell, Plus, X, Check, CalendarDays, CalendarClock } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Group } from '@/types/group';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface ReminderSystemProps {
  groups: Group[];
  className?: string;
}

interface Reminder {
  id: string;
  title: string;
  description: string;
  date: Date;
  groupId: string | number | null;
  type: 'payment' | 'meeting' | 'other';
  status: 'pending' | 'completed' | 'cancelled';
}

export default function ReminderSystem({ groups, className = '' }: ReminderSystemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddReminderOpen, setIsAddReminderOpen] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: '1',
      title: 'Paiement mensuel',
      description: 'Rappel pour le paiement mensuel du groupe Famille',
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // Dans 3 jours
      groupId: groups[0]?.id || null,
      type: 'payment',
      status: 'pending'
    },
    {
      id: '2',
      title: 'Réunion trimestrielle',
      description: 'Réunion pour discuter des progrès du groupe Investissement',
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // Dans 7 jours
      groupId: groups[1]?.id || null,
      type: 'meeting',
      status: 'pending'
    }
  ]);
  const [newReminder, setNewReminder] = useState<Omit<Reminder, 'id'>>({
    title: '',
    description: '',
    date: new Date(),
    groupId: null,
    type: 'payment',
    status: 'pending'
  });
  
  const { t } = useApp();
  const { toast } = useToast();
  
  // Fonction pour ajouter un rappel
  const addReminder = () => {
    if (!newReminder.title) {
      toast({
        title: t('error'),
        description: t('reminderTitleRequired'),
        variant: 'destructive'
      });
      return;
    }
    
    const reminder: Reminder = {
      ...newReminder,
      id: Date.now().toString()
    };
    
    setReminders([...reminders, reminder]);
    setIsAddReminderOpen(false);
    
    toast({
      title: t('reminderAdded'),
      description: t('reminderAddedSuccess'),
    });
    
    // Réinitialiser le formulaire
    setNewReminder({
      title: '',
      description: '',
      date: new Date(),
      groupId: null,
      type: 'payment',
      status: 'pending'
    });
  };
  
  // Fonction pour marquer un rappel comme terminé
  const completeReminder = (id: string) => {
    setReminders(prev => 
      prev.map(reminder => 
        reminder.id === id 
          ? { ...reminder, status: 'completed' } 
          : reminder
      )
    );
    
    toast({
      title: t('reminderCompleted'),
      description: t('reminderCompletedSuccess'),
    });
  };
  
  // Fonction pour supprimer un rappel
  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
    
    toast({
      title: t('reminderDeleted'),
      description: t('reminderDeletedSuccess'),
    });
  };
  
  // Fonction pour formater la date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Fonction pour obtenir le nom du groupe
  const getGroupName = (groupId: string | number | null) => {
    if (!groupId) return t('noGroup');
    const group = groups.find(g => g.id === groupId);
    return group ? group.name : t('unknownGroup');
  };
  
  // Fonction pour obtenir la couleur en fonction du type
  const getTypeColor = (type: 'payment' | 'meeting' | 'other') => {
    switch (type) {
      case 'payment':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'meeting':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'other':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  // Fonction pour obtenir l'icône en fonction du type
  const getTypeIcon = (type: 'payment' | 'meeting' | 'other') => {
    switch (type) {
      case 'payment':
        return <CalendarClock size={16} className="text-green-600 dark:text-green-400" />;
      case 'meeting':
        return <CalendarDays size={16} className="text-blue-600 dark:text-blue-400" />;
      case 'other':
        return <Calendar size={16} className="text-gray-600 dark:text-gray-400" />;
    }
  };
  
  // Calculer les jours restants
  const getDaysRemaining = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return t('overdue');
    if (diffDays === 0) return t('today');
    if (diffDays === 1) return t('tomorrow');
    return `${diffDays} ${t('daysRemaining')}`;
  };
  
  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={t('reminders')}
        title={t('reminders')}
      >
        <Bell size={20} className="text-gray-700 dark:text-gray-300" />
        {reminders.filter(r => r.status === 'pending').length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
            {reminders.filter(r => r.status === 'pending').length}
          </span>
        )}
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
                <Bell size={16} className="mr-2" />
                {t('reminders')}
              </h3>
              
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-xs"
                onClick={() => {
                  setIsAddReminderOpen(true);
                  setIsOpen(false);
                }}
              >
                <Plus size={14} className="mr-1" />
                {t('addReminder')}
              </Button>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {reminders.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  <Calendar size={24} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                  <p>{t('noReminders')}</p>
                </div>
              ) : (
                <div>
                  {reminders.filter(r => r.status === 'pending').length > 0 && (
                    <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                      <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('pendingReminders')}</h4>
                    </div>
                  )}
                  
                  {reminders
                    .filter(r => r.status === 'pending')
                    .sort((a, b) => a.date.getTime() - b.date.getTime())
                    .map(reminder => (
                      <div
                        key={reminder.id}
                        className="p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mr-3 mt-0.5">
                            {getTypeIcon(reminder.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {reminder.title}
                              </p>
                              
                              <div className="flex items-center ml-2">
                                <button
                                  onClick={() => completeReminder(reminder.id)}
                                  className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                                  aria-label={t('markAsCompleted')}
                                  title={t('markAsCompleted')}
                                >
                                  <Check size={14} />
                                </button>
                                
                                <button
                                  onClick={() => deleteReminder(reminder.id)}
                                  className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                  aria-label={t('delete')}
                                  title={t('delete')}
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                            
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {reminder.description}
                            </p>
                            
                            <div className="flex items-center justify-between mt-2">
                              <span className={`text-xs px-1.5 py-0.5 rounded-full ${getTypeColor(reminder.type)}`}>
                                {reminder.type === 'payment' ? t('payment') : reminder.type === 'meeting' ? t('meeting') : t('other')}
                              </span>
                              
                              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                <Clock size={12} className="mr-1" />
                                {getDaysRemaining(reminder.date)}
                              </span>
                            </div>
                            
                            <div className="mt-1 flex justify-between items-center">
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                {formatDate(reminder.date)}
                              </span>
                              
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                {getGroupName(reminder.groupId)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  
                  {reminders.filter(r => r.status === 'completed').length > 0 && (
                    <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                      <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('completedReminders')}</h4>
                    </div>
                  )}
                  
                  {reminders
                    .filter(r => r.status === 'completed')
                    .slice(0, 3) // Limiter à 3 rappels terminés
                    .map(reminder => (
                      <div
                        key={reminder.id}
                        className="p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors opacity-70"
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mr-3 mt-0.5">
                            <Check size={16} className="text-green-600 dark:text-green-400" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate line-through">
                                {reminder.title}
                              </p>
                              
                              <button
                                onClick={() => deleteReminder(reminder.id)}
                                className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                aria-label={t('delete')}
                                title={t('delete')}
                              >
                                <X size={14} />
                              </button>
                            </div>
                            
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {formatDate(reminder.date)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
            
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
      
      {/* Modal pour ajouter un rappel */}
      <Dialog open={isAddReminderOpen} onOpenChange={setIsAddReminderOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('addReminder')}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('title')}
              </label>
              <Input
                value={newReminder.title}
                onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                placeholder={t('reminderTitlePlaceholder')}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('description')}
              </label>
              <Textarea
                value={newReminder.description}
                onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                placeholder={t('reminderDescriptionPlaceholder')}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('date')}
              </label>
              <Input
                type="date"
                value={newReminder.date.toISOString().split('T')[0]}
                onChange={(e) => setNewReminder({ ...newReminder, date: new Date(e.target.value) })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('type')}
              </label>
              <Select
                value={newReminder.type}
                onValueChange={(value: 'payment' | 'meeting' | 'other') => 
                  setNewReminder({ ...newReminder, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment">{t('payment')}</SelectItem>
                  <SelectItem value="meeting">{t('meeting')}</SelectItem>
                  <SelectItem value="other">{t('other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('group')}
              </label>
              <Select
                value={newReminder.groupId?.toString() || ''}
                onValueChange={(value) => 
                  setNewReminder({ ...newReminder, groupId: value ? value : null })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectGroup')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('noGroup')}</SelectItem>
                  {groups.map(group => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddReminderOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={addReminder}>
              {t('addReminder')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
