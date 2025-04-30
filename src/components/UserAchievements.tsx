import React, { useState, useEffect } from 'react';
import { Award, Trophy, Star, TrendingUp, Medal, Shield, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  getUserAchievements, 
  getUserLevel, 
  checkAndAwardAchievements,
  Achievement,
  UserLevel
} from '@/services/gamificationService';

export default function UserAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const loadUserData = async () => {
      setIsLoading(true);
      
      // Charger le niveau de l'utilisateur
      const levelResponse = await getUserLevel(user.id);
      if (levelResponse.success) {
        setUserLevel(levelResponse.data);
      }
      
      // Charger les réalisations de l'utilisateur
      const achievementsResponse = await getUserAchievements(user.id);
      if (achievementsResponse.success) {
        setAchievements(achievementsResponse.data.map(ua => ua.achievements) || []);
      }
      
      // Vérifier les nouvelles réalisations
      const newAchievementsResponse = await checkAndAwardAchievements(user.id);
      if (newAchievementsResponse.success && newAchievementsResponse.data.length > 0) {
        // Ajouter les nouvelles réalisations à la liste
        setAchievements(prev => [...prev, ...newAchievementsResponse.data]);
        
        // Afficher un toast pour chaque nouvelle réalisation
        newAchievementsResponse.data.forEach(achievement => {
          toast({
            title: "Nouvelle réalisation !",
            description: `Vous avez débloqué "${achievement.name}" (+${achievement.points} points)`,
          });
        });
        
        // Recharger le niveau de l'utilisateur
        const updatedLevelResponse = await getUserLevel(user.id);
        if (updatedLevelResponse.success) {
          setUserLevel(updatedLevelResponse.data);
        }
      }
      
      setIsLoading(false);
    };

    loadUserData();
  }, [user, toast]);

  const getAchievementIcon = (category: string) => {
    switch (category) {
      case 'beginner':
        return <Star className="h-6 w-6 text-blue-500" />;
      case 'intermediate':
        return <Medal className="h-6 w-6 text-green-500" />;
      case 'advanced':
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 'expert':
        return <Award className="h-6 w-6 text-purple-500" />;
      default:
        return <Shield className="h-6 w-6 text-gray-500" />;
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    if (activeTab === 'all') return true;
    return achievement.category === activeTab;
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Réalisations et Niveau</CardTitle>
        <CardDescription>
          Suivez votre progression et débloquez des récompenses
        </CardDescription>
      </CardHeader>
      
      {userLevel && (
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="bg-primary/10 p-2 rounded-full mr-3">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Niveau {userLevel.level}</h3>
                <p className="text-sm text-gray-500">{userLevel.points} points</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-primary/5">
              <Zap className="h-3.5 w-3.5 mr-1 text-primary" />
              {Math.round(userLevel.progress_percentage)}% vers niveau {userLevel.level + 1}
            </Badge>
          </div>
          <Progress value={userLevel.progress_percentage} className="h-2" />
          <p className="text-xs text-gray-500 mt-2 text-right">
            {userLevel.next_level_points - userLevel.points} points restants pour le niveau {userLevel.level + 1}
          </p>
        </div>
      )}
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">Toutes</TabsTrigger>
            <TabsTrigger value="beginner">Débutant</TabsTrigger>
            <TabsTrigger value="intermediate">Intermédiaire</TabsTrigger>
            <TabsTrigger value="advanced">Avancé</TabsTrigger>
          </TabsList>
        </div>
        
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : filteredAchievements.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Aucune réalisation dans cette catégorie</p>
                <p className="text-sm mt-2">Continuez à utiliser l'application pour en débloquer !</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAchievements.map((achievement) => (
                  <div 
                    key={achievement.id}
                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                  >
                    <div className="flex items-start">
                      <div className="mr-4">
                        {getAchievementIcon(achievement.category)}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <h4 className="text-base font-medium text-gray-900 dark:text-white">
                            {achievement.name}
                          </h4>
                          <Badge className="ml-2 bg-primary/10 text-primary border-primary/20">
                            +{achievement.points} pts
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {achievement.description}
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
      
      <CardFooter className="flex justify-between pt-4 border-t">
        <p className="text-sm text-gray-500">
          Total: {achievements.length} réalisations débloquées
        </p>
        <p className="text-sm text-gray-500">
          {achievements.reduce((sum, a) => sum + a.points, 0)} points gagnés
        </p>
      </CardFooter>
    </Card>
  );
}
