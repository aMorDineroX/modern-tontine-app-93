import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Info, AlertTriangle, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Notification, 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  subscribeToUserNotifications
} from '@/services/enhancedNotificationService';
import { useNavigate } from 'react-router-dom';

export default function EnhancedNotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    // Charger les notifications initiales
    const loadNotifications = async () => {
      setIsLoading(true);
      const response = await getUserNotifications(user.id);
      if (response.success) {
        setNotifications(response.data || []);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger les notifications",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    };

    loadNotifications();

    // S'abonner aux nouvelles notifications
    const subscription = subscribeToUserNotifications(user.id, (newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
      
      // Afficher un toast pour la nouvelle notification
      toast({
        title: newNotification.title,
        description: newNotification.message,
      });
    });

    return () => {
      // Se désabonner lors du démontage du composant
      subscription.unsubscribe();
    };
  }, [user, toast]);

  const handleMarkAsRead = async (notificationId: string) => {
    const response = await markNotificationAsRead(notificationId);
    if (response.success) {
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    
    const response = await markAllNotificationsAsRead(user.id);
    if (response.success) {
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      toast({
        title: "Succès",
        description: "Toutes les notifications ont été marquées comme lues",
      });
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Marquer comme lu
    handleMarkAsRead(notification.id);
    
    // Rediriger si une URL d'action est spécifiée
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.read;
    return notification.type === activeTab;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <CardTitle>Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} non lues
              </Badge>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            <Check className="h-4 w-4 mr-1" />
            Tout marquer comme lu
          </Button>
        </div>
        <CardDescription>
          Restez informé des dernières activités
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="px-4">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">Toutes</TabsTrigger>
            <TabsTrigger value="unread">Non lues</TabsTrigger>
            <TabsTrigger value="success">Succès</TabsTrigger>
            <TabsTrigger value="warning">Alertes</TabsTrigger>
          </TabsList>
        </div>
        
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-tontine-purple"></div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Aucune notification</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-3 rounded-lg border transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      notification.read 
                        ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700' 
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start">
                      <div className="mr-3 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500">
                              {new Date(notification.created_at).toLocaleDateString()}
                            </span>
                            {notification.action_url && (
                              <ExternalLink className="h-3 w-3 ml-1 text-gray-400" />
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Tabs>
      
      <CardFooter className="flex justify-between pt-3 border-t">
        <Button variant="outline" size="sm" onClick={() => setActiveTab("all")}>
          Voir toutes
        </Button>
        <Button variant="ghost" size="sm" onClick={() => navigate("/settings/notifications")}>
          Paramètres
        </Button>
      </CardFooter>
    </Card>
  );
}
