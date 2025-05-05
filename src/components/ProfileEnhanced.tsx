
import { useState } from "react";
import { User, Camera, EditIcon, Bookmark, Bell, Calendar, Eye, Clock, MessageSquare, DollarSign, KeyRound, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SocialShare from "./SocialShare";
import InviteFriends from "./InviteFriends";
import ActivityFeed from "./ActivityFeed";
import { Link } from "react-router-dom";

export default function ProfileEnhanced() {
  const { user } = useAuth();
  const { t, formatAmount } = useApp();
  const [activeTab, setActiveTab] = useState("activity");

  // Pour la démo, nous utilisons des données fictives
  const userStats = {
    totalContributions: formatAmount(1250),
    groupsJoined: 3,
    upcomingPayments: 2,
    joinDate: new Date(2023, 5, 15)
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const upcomingPayments = [
    {
      id: 1,
      groupName: "Tontine Familiale",
      amount: formatAmount(200),
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3) // Dans 3 jours
    },
    {
      id: 2,
      groupName: "Tontine Amis",
      amount: formatAmount(150),
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10) // Dans 10 jours
    }
  ];

  const savedGroups = [
    {
      id: 1,
      name: "Tontine Familiale",
      members: 8,
      nextPayout: formatDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 3))
    },
    {
      id: 2,
      name: "Tontine Amis",
      members: 5,
      nextPayout: formatDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 10))
    },
    {
      id: 3,
      name: "Tontine Projet Maison",
      members: 4,
      nextPayout: formatDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 20))
    }
  ];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 animate-fade-in">
      <div className="relative">
        {/* Background Banner */}
        <div className="h-40 rounded-t-lg bg-gradient-to-r from-tontine-purple to-tontine-light-purple" />

        {/* Profile Info */}
        <div className="flex flex-col md:flex-row items-center md:items-end md:justify-between px-6 -mt-16 pb-4">
          <div className="flex flex-col items-center md:items-start md:flex-row md:space-x-4">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-800">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-tontine-soft-green text-primary text-xl">
                  {user?.email?.substring(0, 2).toUpperCase() || <User />}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-center md:text-left mt-4 md:mt-0">
              <h1 className="text-2xl font-bold">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                {t('memberSince')}: {formatDate(new Date(user?.created_at || userStats.joinDate))}
              </p>
            </div>
          </div>

          <div className="flex flex-row space-x-2 mt-4 md:mt-0">
            <Button variant="outline" size="sm" className="gap-2">
              <EditIcon className="h-4 w-4" />
              <span>{t('editProfile')}</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link to="/change-password">
                <KeyRound className="h-4 w-4" />
                <span>Changer mot de passe</span>
              </Link>
            </Button>
            <SocialShare
              title={`${t('checkOut')} ${user?.user_metadata?.full_name || user?.email?.split('@')[0]} ${t('profile')}`}
              description={t('joinTontine')}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('totalContributions')}</h3>
            <DollarSign className="h-5 w-5 text-primary opacity-70" />
          </div>
          <p className="text-2xl font-bold mt-1">{userStats.totalContributions}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('groupsJoined')}</h3>
            <User className="h-5 w-5 text-primary opacity-70" />
          </div>
          <p className="text-2xl font-bold mt-1">{userStats.groupsJoined}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('upcomingPayments')}</h3>
            <Calendar className="h-5 w-5 text-primary opacity-70" />
          </div>
          <p className="text-2xl font-bold mt-1">{userStats.upcomingPayments}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('actions')}</h3>
            <Bell className="h-5 w-5 text-primary opacity-70" />
          </div>
          <div className="mt-2">
            <InviteFriends />
          </div>
        </div>
      </div>

      {/* Tabs Content */}
      <div className="mt-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start">
            <TabsTrigger value="activity" className="gap-2">
              <Clock className="h-4 w-4" />
              {t('activity')}
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="gap-2">
              <Eye className="h-4 w-4" />
              {t('upcoming')}
            </TabsTrigger>
            <TabsTrigger value="saved" className="gap-2">
              <Bookmark className="h-4 w-4" />
              {t('savedGroups')}
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              {t('messages')}
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              Sécurité
            </TabsTrigger>
          </TabsList>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mt-4 border border-gray-100 dark:border-gray-700">
            <TabsContent value="activity">
              <ActivityFeed limit={10} />
            </TabsContent>

            <TabsContent value="upcoming">
              <h3 className="font-semibold text-lg mb-4">{t('upcomingPayments')}</h3>
              {upcomingPayments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingPayments.map(payment => (
                    <div key={payment.id} className="flex justify-between items-center p-3 border border-gray-100 dark:border-gray-700 rounded-lg">
                      <div>
                        <h4 className="font-medium">{payment.groupName}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(payment.date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-tontine-dark-green">{payment.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {t('noUpcomingPayments')}
                </div>
              )}
            </TabsContent>

            <TabsContent value="saved">
              <h3 className="font-semibold text-lg mb-4">{t('savedGroups')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedGroups.map(group => (
                  <div key={group.id} className="border border-gray-100 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h4 className="font-medium">{group.name}</h4>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {group.members} {t('members')}
                      </span>
                      <SocialShare title={group.name} />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {t('nextPayout')}: {group.nextPayout}
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="messages">
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-medium text-lg mb-2">{t('noMessages')}</h3>
                <p>{t('noMessagesDesc')}</p>
              </div>
            </TabsContent>

            <TabsContent value="security">
              <h3 className="font-semibold text-lg mb-4">Sécurité du compte</h3>
              <div className="space-y-6">
                <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Mot de passe</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Dernière modification: {formatDate(new Date(user?.updated_at || Date.now()))}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/change-password" className="flex items-center gap-2">
                        <KeyRound className="h-4 w-4" />
                        Modifier
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Authentification à deux facteurs</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Ajoutez une couche de sécurité supplémentaire à votre compte
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Shield className="h-4 w-4" />
                      Activer
                    </Button>
                  </div>
                </div>

                <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Sessions actives</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Gérez les appareils connectés à votre compte
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="h-4 w-4" />
                      Voir
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
