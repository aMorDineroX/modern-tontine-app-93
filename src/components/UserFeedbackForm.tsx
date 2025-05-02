import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/utils/supabase";
import { Star, Send, Loader2 } from "lucide-react";

interface UserFeedbackFormProps {
  featureId: string;
  featureName: string;
  onClose?: () => void;
}

export default function UserFeedbackForm({ featureId, featureName, onClose }: UserFeedbackFormProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [usability, setUsability] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [contactConsent, setContactConsent] = useState<boolean>(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating) {
      toast({
        title: "Évaluation requise",
        description: "Veuillez attribuer une note à cette fonctionnalité.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const feedbackData = {
        feature_id: featureId,
        feature_name: featureName,
        rating,
        usability,
        feedback,
        email: contactConsent ? (email || user?.email || "") : "",
        user_id: user?.id || null,
        contact_consent: contactConsent,
        created_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('user_feedback')
        .insert(feedbackData);
      
      if (error) throw error;
      
      setIsSubmitted(true);
      
      toast({
        title: "Merci pour votre feedback !",
        description: "Vos commentaires nous aident à améliorer l'application.",
      });
      
      // Réinitialiser le formulaire après 3 secondes
      setTimeout(() => {
        if (onClose) {
          onClose();
        } else {
          setRating(null);
          setUsability("");
          setFeedback("");
          setEmail("");
          setContactConsent(false);
          setIsSubmitted(false);
        }
      }, 3000);
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi du feedback:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de votre feedback. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderStars = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-primary ${
              rating && star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
            onClick={() => setRating(star)}
          >
            <Star className="h-6 w-6 fill-current" />
          </button>
        ))}
      </div>
    );
  };
  
  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Merci pour votre feedback !</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Vos commentaires sont précieux et nous aident à améliorer l'application.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Évaluez cette fonctionnalité</CardTitle>
        <CardDescription>
          Partagez votre expérience avec {featureName}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Comment évaluez-vous cette fonctionnalité ?</Label>
            <div className="flex justify-center py-2">
              {renderStars()}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="usability">Facilité d'utilisation</Label>
            <RadioGroup id="usability" value={usability} onValueChange={setUsability}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="very_easy" id="very_easy" />
                <Label htmlFor="very_easy">Très facile</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="easy" id="easy" />
                <Label htmlFor="easy">Facile</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="neutral" id="neutral" />
                <Label htmlFor="neutral">Neutre</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="difficult" id="difficult" />
                <Label htmlFor="difficult">Difficile</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="very_difficult" id="very_difficult" />
                <Label htmlFor="very_difficult">Très difficile</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="feedback">Vos commentaires</Label>
            <Textarea
              id="feedback"
              placeholder="Partagez votre expérience, suggestions ou problèmes rencontrés..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="contact_consent"
                checked={contactConsent}
                onCheckedChange={(checked) => setContactConsent(checked as boolean)}
              />
              <Label htmlFor="contact_consent">
                Je souhaite être contacté pour discuter de mon feedback
              </Label>
            </div>
          </div>
          
          {contactConsent && !user && (
            <div className="space-y-2">
              <Label htmlFor="email">Votre email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {onClose && (
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Annuler
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Envoyer
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
