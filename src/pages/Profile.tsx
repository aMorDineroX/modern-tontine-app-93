import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Mail, UserRound, Lock, Edit, Camera, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/utils/supabase";
import UserProfile from "@/components/UserProfile";
import Navbar from "@/components/Navbar"; // Import Navbar

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Password change fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Contribution stats
  const [totalContributions, setTotalContributions] = useState(0);
  const [activeGroups, setActiveGroups] = useState(0);
  
  useEffect(() => {
    if (user) {
      // Load initial user data
      setEmail(user.email || "");
      
      // Try to get user metadata if available
      const metadata = user.user_metadata;
      if (metadata) {
        setFullName(metadata.full_name || "");
        setAvatarUrl(metadata.avatar_url || "");
      }
      
      // Fetch additional profile data from our database
      loadUserProfile();
    }
  }, [user]);
  
  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Example of fetching user-specific data
      // This is just a placeholder - implement based on your actual data model
      const { data: contributionData, error: contributionError } = await supabase
        .from("contributions")
        .select("*")
        .eq("user_id", user.id);
      
      if (contributionError) throw contributionError;
      
      // Calculate statistics from user data
      if (contributionData) {
        setTotalContributions(contributionData.length);
      }
      
      // Get active groups
      const { data: groupsData, error: groupsError } = await supabase
        .from("group_members")
        .select("*")
        .eq("user_id", user.id);
      
      if (groupsError) throw groupsError;
      
      if (groupsData) {
        setActiveGroups(groupsData.length);
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du profil",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateProfile = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      });
      
      if (error) throw error;
      
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès",
      });
      
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleChangePassword = async () => {
    if (!user) return;
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      
      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été modifié avec succès",
      });
      
      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Erreur",
        description: "Impossible de changer le mot de passe",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Vous n'êtes pas connecté</h2>
          <Button onClick={() => navigate("/signin")}>Se connecter</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-fade-in">
      <Navbar /> {/* Add Navbar component */}
      
      <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mon Profil</h1>
          <p className="text-muted-foreground">Gérez vos informations personnelles et vos préférences</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="col-span-1">
            <Card className="p-6 flex flex-col items-center shadow-md">
              {isEditingProfile ? (
                <div className="relative w-32 h-32 mb-4 rounded-full overflow-hidden border-2 border-tontine-purple">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-tontine-soft-blue flex items-center justify-center">
                      <UserRound size={64} className="text-tontine-purple" />
                    </div>
                  )}
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="absolute bottom-0 right-0 rounded-full bg-white"
                  >
                    <Camera size={16} />
                  </Button>
                </div>
              ) : (
                <UserProfile 
                  name={fullName || email.split('@')[0]} 
                  contribution={`${totalContributions} contribution${totalContributions !== 1 ? 's' : ''}`} 
                  image={avatarUrl} 
                />
              )}
              
              {isEditingProfile ? (
                <div className="w-full space-y-4 mt-4">
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nom complet"
                    className="tontine-input"
                  />
                  <div className="flex justify-between gap-2">
                    <Button 
                      variant="outline" 
                      className="w-1/2"
                      onClick={() => setIsEditingProfile(false)}
                    >
                      <X size={16} className="mr-2" /> Annuler
                    </Button>
                    <Button 
                      className="w-1/2 tontine-button-primary"
                      onClick={handleUpdateProfile}
                      disabled={isLoading}
                    >
                      <Save size={16} className="mr-2" /> Enregistrer
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsEditingProfile(true)}
                >
                  <Edit size={16} className="mr-2" /> Modifier le profil
                </Button>
              )}
              
              <div className="w-full mt-8 grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-tontine-soft-blue/50 rounded-lg">
                  <p className="text-2xl font-bold">{activeGroups}</p>
                  <p className="text-sm text-muted-foreground">Groupes</p>
                </div>
                <div className="p-3 bg-tontine-soft-green/50 rounded-lg">
                  <p className="text-2xl font-bold">{totalContributions}</p>
                  <p className="text-sm text-muted-foreground">Contributions</p>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="mt-8 text-red-500 hover:text-red-700 hover:bg-red-50 w-full"
                onClick={handleSignOut}
              >
                Se déconnecter
              </Button>
            </Card>
          </div>
          
          {/* Account Settings */}
          <div className="col-span-1 md:col-span-2">
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="account">Compte</TabsTrigger>
                <TabsTrigger value="security">Sécurité</TabsTrigger>
              </TabsList>
              
              <TabsContent value="account" className="space-y-6">
                <Card className="p-6 shadow-md">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <UserRound className="mr-2" size={20} />
                    Informations personnelles
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nom complet</label>
                      <Input 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)}
                        className="tontine-input"
                        disabled={!isEditingProfile}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <Input 
                        value={email} 
                        className="tontine-input" 
                        disabled 
                      />
                      <p className="text-xs text-muted-foreground mt-1">Votre adresse email ne peut pas être modifiée</p>
                    </div>
                    
                    {!isEditingProfile && (
                      <Button 
                        onClick={() => setIsEditingProfile(true)}
                        className="tontine-button-primary"
                      >
                        <Edit size={16} className="mr-2" /> Modifier
                      </Button>
                    )}
                  </div>
                </Card>
                
                <Card className="p-6 shadow-md">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Mail className="mr-2" size={20} />
                    Préférences de notification
                  </h2>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <h3 className="font-medium">Emails de paiements</h3>
                        <p className="text-sm text-muted-foreground">Recevoir des rappels pour les paiements à venir</p>
                      </div>
                      <div className="form-control">
                        <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <h3 className="font-medium">Nouvelles invitations</h3>
                        <p className="text-sm text-muted-foreground">Être notifié des invitations à de nouveaux groupes</p>
                      </div>
                      <div className="form-control">
                        <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="security" className="space-y-6">
                <Card className="p-6 shadow-md">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Lock className="mr-2" size={20} />
                    Changer le mot de passe
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Mot de passe actuel</label>
                      <Input 
                        type="password" 
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="tontine-input"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Nouveau mot de passe</label>
                      <Input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="tontine-input"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Confirmer le mot de passe</label>
                      <Input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="tontine-input"
                      />
                    </div>
                    
                    <Button 
                      onClick={handleChangePassword}
                      className="tontine-button-primary"
                      disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
                    >
                      Mettre à jour le mot de passe
                    </Button>
                  </div>
                </Card>
                
                <Card className="p-6 shadow-md">
                  <h2 className="text-xl font-semibold mb-4 text-red-500">Zone de danger</h2>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-4">
                      La suppression de votre compte est définitive et supprimera toutes vos données. Cette action ne peut pas être annulée.
                    </p>
                    
                    <Button 
                      variant="destructive"
                    >
                      Supprimer mon compte
                    </Button>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
