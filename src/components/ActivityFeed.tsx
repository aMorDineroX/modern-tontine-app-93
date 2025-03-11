
import { useEffect, useState } from "react";
import { User, DollarSign, UserPlus, Calendar } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

type ActivityType = "contribution" | "payout" | "join" | "creation";

type Activity = {
  id: number;
  type: ActivityType;
  user: {
    id: string;
    name: string;
    image?: string;
  };
  groupId?: number;
  groupName?: string;
  amount?: number | string;
  date: Date;
  message?: string;
};

type ActivityFeedProps = {
  groupId?: number;
  limit?: number;
};

export default function ActivityFeed({ groupId, limit = 5 }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, formatAmount } = useApp();
  
  useEffect(() => {
    // Simuler le chargement des activités depuis l'API
    // Dans une vraie implémentation, ceci serait remplacé par un appel API
    setTimeout(() => {
      const mockActivities: Activity[] = [
        {
          id: 1,
          type: "contribution",
          user: { id: "1", name: "Sophie Martin" },
          groupId: 1,
          groupName: "Tontine Familiale",
          amount: 50,
          date: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 heures avant
        },
        {
          id: 2,
          type: "join",
          user: { id: "2", name: "Thomas Dubois" },
          groupId: 1,
          groupName: "Tontine Familiale",
          date: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 jour avant
        },
        {
          id: 3,
          type: "payout",
          user: { id: "3", name: "Marie Leclerc" },
          groupId: 2,
          groupName: "Tontine Amis",
          amount: 300,
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 jours avant
        },
        {
          id: 4,
          type: "creation",
          user: { id: "4", name: "Lucas Bernard" },
          groupId: 3,
          groupName: "Tontine Projet Maison",
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) // 1 semaine avant
        },
        {
          id: 5,
          type: "contribution",
          user: { id: "5", name: "Emma Petit" },
          groupId: 2,
          groupName: "Tontine Amis",
          amount: 75,
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) // 3 jours avant
        }
      ]; 
      
      // Filtrer par groupId si spécifié
      const filteredActivities = groupId 
        ? mockActivities.filter(activity => activity.groupId === groupId)
        : mockActivities;
      
      setActivities(filteredActivities.slice(0, limit));
      setLoading(false);
    }, 1000);
  }, [groupId, limit]);
  
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) {
      return `${minutes} ${minutes === 1 ? t('minute') : t('minutes')}`;
    } else if (hours < 24) {
      return `${hours} ${hours === 1 ? t('hour') : t('hours')}`;
    } else {
      return `${days} ${days === 1 ? t('day') : t('days')}`;
    }
  };
  
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case "contribution":
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case "payout":
        return <DollarSign className="h-5 w-5 text-blue-500" />;
      case "join":
        return <UserPlus className="h-5 w-5 text-purple-500" />;
      case "creation":
        return <Calendar className="h-5 w-5 text-orange-500" />;
      default:
        return <User className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getActivityMessage = (activity: Activity) => {
    const tKey = `activity${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}`;
    let message = t(tKey as any);
    
    // Replace template placeholders with actual values
    message = message.replace('{user}', activity.user.name);
    if (activity.amount) {
      message = message.replace('{amount}', formatAmount(activity.amount));
    }
    if (activity.groupName) {
      message = message.replace('{group}', activity.groupName);
    }
    
    return message;
  };
  
  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start space-x-4 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4 animate-fade-in">
      <h3 className="font-semibold text-lg">{t('recentActivity')}</h3>
      
      {activities.length === 0 ? (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          {t('noRecentActivity')}
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="mt-1 p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1">
                <p className="text-sm">{getActivityMessage(activity)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {getTimeAgo(activity.date)} {t('ago')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
