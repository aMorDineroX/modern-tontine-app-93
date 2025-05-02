import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Star, Users, ThumbsUp, ThumbsDown, BarChart2 } from "lucide-react";
import { getFeatureFeedbackStats, FeedbackStats } from '@/services/userFeedbackService';

interface FeedbackStatsProps {
  featureId: string;
  featureName: string;
}

export default function FeedbackStats({ featureId, featureName }: FeedbackStatsProps) {
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await getFeatureFeedbackStats(featureId);
        
        if (response.success) {
          setStats(response.data);
        } else {
          setError("Impossible de charger les statistiques de feedback");
        }
      } catch (err) {
        setError("Une erreur est survenue lors du chargement des statistiques");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStats();
  }, [featureId]);
  
  const getStarColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-500";
    if (rating >= 3.5) return "text-lime-500";
    if (rating >= 2.5) return "text-yellow-500";
    if (rating >= 1.5) return "text-orange-500";
    return "text-red-500";
  };
  
  const getUsabilityLabel = (key: string) => {
    switch (key) {
      case 'very_easy': return 'Très facile';
      case 'easy': return 'Facile';
      case 'neutral': return 'Neutre';
      case 'difficult': return 'Difficile';
      case 'very_difficult': return 'Très difficile';
      default: return key;
    }
  };
  
  const getUsabilityColor = (key: string) => {
    switch (key) {
      case 'very_easy': return 'bg-green-500';
      case 'easy': return 'bg-lime-500';
      case 'neutral': return 'bg-yellow-500';
      case 'difficult': return 'bg-orange-500';
      case 'very_difficult': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error || !stats) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-500">
            <BarChart2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>{error || "Aucune statistique disponible"}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Si aucun feedback n'a été soumis
  if (stats.total_feedback === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Statistiques de feedback</CardTitle>
          <CardDescription>
            {featureName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Aucun feedback n'a encore été soumis pour cette fonctionnalité.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistiques de feedback</CardTitle>
        <CardDescription>
          {featureName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Note moyenne</h3>
            <div className="flex items-center mt-1">
              <span className={`text-2xl font-bold mr-2 ${getStarColor(stats.average_rating)}`}>
                {stats.average_rating.toFixed(1)}
              </span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`h-5 w-5 ${
                      star <= Math.round(stats.average_rating) 
                        ? `fill-current ${getStarColor(stats.average_rating)}` 
                        : 'text-gray-300'
                    }`} 
                  />
                ))}
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-sm">
            <Users className="h-4 w-4 mr-1" />
            {stats.total_feedback} avis
          </Badge>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Distribution des notes</h3>
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.rating_distribution[rating as keyof typeof stats.rating_distribution];
            const percentage = stats.total_feedback > 0 
              ? Math.round((count / stats.total_feedback) * 100) 
              : 0;
              
            return (
              <div key={rating} className="flex items-center">
                <div className="w-12 text-sm font-medium">
                  {rating} <Star className="h-3 w-3 inline fill-current text-yellow-400" />
                </div>
                <div className="flex-1 mx-2">
                  <Progress value={percentage} className="h-2" />
                </div>
                <div className="w-12 text-sm text-right">
                  {percentage}%
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Facilité d'utilisation</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(stats.usability_distribution).map(([key, value]) => {
              const percentage = stats.total_feedback > 0 
                ? Math.round((value / stats.total_feedback) * 100) 
                : 0;
                
              if (percentage === 0) return null;
              
              return (
                <div key={key} className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getUsabilityColor(key)}`} />
                  <div className="flex-1 text-sm">{getUsabilityLabel(key)}</div>
                  <div className="text-sm font-medium">{percentage}%</div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex items-center">
            <ThumbsUp className="h-5 w-5 text-green-500 mr-1" />
            <span className="text-sm text-gray-600">
              {Math.round((stats.rating_distribution['4'] + stats.rating_distribution['5']) / stats.total_feedback * 100)}% recommandent
            </span>
          </div>
          <div className="flex items-center">
            <ThumbsDown className="h-5 w-5 text-red-500 mr-1" />
            <span className="text-sm text-gray-600">
              {Math.round((stats.rating_distribution['1'] + stats.rating_distribution['2']) / stats.total_feedback * 100)}% ne recommandent pas
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-gray-500">
        Dernière mise à jour: {new Date().toLocaleDateString()}
      </CardFooter>
    </Card>
  );
}
