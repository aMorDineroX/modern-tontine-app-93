import { useState, useEffect, useCallback, useMemo, Suspense, lazy } from "react";
import {
  Plus,
  Search,
  Filter,
  SlidersHorizontal,
  Users,
  Info,
  ArrowUpDown,
  MessageSquare,
  RefreshCw,
  UserPlus,
  Loader2,
  ChevronDown,
  ChevronUp,
  Grid,
  List,
  LayoutGrid,
  Tag,
  Calendar,
  Bell,
  Star,
  StarOff,
  Download,
  QrCode,
  Clock,
  BellRing
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import TontineGroup from "@/components/TontineGroup";
import CreateGroupModal from "@/components/CreateGroupModal";
import MemberList from "@/components/MemberList";
import WhatsAppIntegration from "@/components/WhatsAppIntegration";
import KanbanView from "@/components/KanbanView";
import AdvancedFilters from "@/components/AdvancedFilters";
import TagBadge from "@/components/TagBadge";
import RealtimeNotifications from "@/components/RealtimeNotifications";
import ThemeToggle from "@/components/ThemeToggle";
import ExportData from "@/components/ExportData";
import ReminderSystem from "@/components/ReminderSystem";
import GroupStatistics from "@/components/GroupStatistics";
import ShareGroup from "@/components/ShareGroup";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import CalendarView from "@/components/CalendarView";
import NotificationCenter from "@/components/NotificationCenter";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { supabase, fetchUserGroups } from "@/utils/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMediaQuery } from "@/hooks/use-media-query";
import PersistentChat from "@/components/PersistentChat";
import { Group } from "@/types/group";

const Groups = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [view, setView] = useState<"grid" | "list" | "kanban" | "calendar">("grid");
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [favoriteGroups, setFavoriteGroups] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [groupsPerPage] = useState(9);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [showOfflineWarning, setShowOfflineWarning] = useState(false);
  const [offlineCache, setOfflineCache] = useState<Group[]>([]);

  // Liste des tags disponibles (normalement récupérée depuis la base de données)
  const availableTags = [
    "Famille", "Amis", "Collègues", "Épargne", "Investissement",
    "Court terme", "Long terme", "Mensuel", "Hebdomadaire", "Priorité"
  ];

  const { t, formatAmount } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Fonction pour récupérer les groupes
  const fetchGroups = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      console.log("Fetching groups, user:", user);

      if (!user) {
        setGroups([]);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      // Use the fetchUserGroups utility function
      const { data: groupsData, error } = await fetchUserGroups(user.id);

      if (error) {
        console.error("Error fetching groups:", error);
        throw error;
      }

      console.log("Groups data:", groupsData);

      if (!groupsData || groupsData.length === 0) {
        setGroups([]);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      // Get member counts for each group
      const groupsWithMemberCount = await Promise.all(
        groupsData.map(async (group) => {
          const { count, error } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          if (error) {
            console.error("Error counting members:", error);
          }

          // Calculate next due date based on frequency and start date
          const startDate = new Date(group.start_date);
          let nextDue = new Date(startDate);
          const today = new Date();

          while (nextDue < today) {
            if (group.frequency === 'weekly') {
              nextDue.setDate(nextDue.getDate() + 7);
            } else if (group.frequency === 'biweekly') {
              nextDue.setDate(nextDue.getDate() + 14);
            } else {
              nextDue.setMonth(nextDue.getMonth() + 1);
            }
          }

          // Calculate progress (mock implementation)
          const progress = Math.min(
            Math.round((today.getTime() - startDate.getTime()) /
            (nextDue.getTime() - startDate.getTime()) * 100),
            100
          );

          // Fetch the status of the current user in this group
          const { data: membershipData, error: membershipError } = await supabase
            .from('group_members')
            .select('status')
            .eq('group_id', group.id)
            .eq('user_id', user.id)
            .single();

          const status = membershipData ? membershipData.status : "active";

          // Ajouter des tags aléatoires pour la démonstration
          const randomTags = [];
          if (Math.random() > 0.5) randomTags.push("Famille");
          if (Math.random() > 0.7) randomTags.push("Épargne");
          if (Math.random() > 0.8) randomTags.push("Priorité");
          if (Math.random() > 0.6) randomTags.push("Mensuel");
          if (Math.random() > 0.9) randomTags.push("Investissement");

          return {
            id: group.id,
            name: group.name,
            members: count || 1,  // Default to 1 if count is null
            contribution: group.contribution_amount,
            frequency: group.frequency,
            nextDue: nextDue.toLocaleDateString(),
            status: status as "active" | "pending" | "completed",
            progress: progress || 0,
            tags: randomTags
          };
        })
      );

      console.log("Processed groups:", groupsWithMemberCount);
      setGroups(groupsWithMemberCount);

      if (isRefresh) {
        toast({
          title: t('refreshed'),
          description: t('groupsRefreshed'),
        });
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast({
        title: "Error",
        description: "Error fetching groups",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user, toast, t]);

  // Fetch groups on component mount
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Fonctions pour gérer les favoris
  const toggleFavorite = useCallback((groupId: string | number) => {
    setFavoriteGroups(prev => {
      const groupIdStr = String(groupId);
      if (prev.includes(groupIdStr)) {
        return prev.filter(id => id !== groupIdStr);
      } else {
        return [...prev, groupIdStr];
      }
    });
    
    // Enregistrer les favoris dans le stockage local
    try {
      localStorage.setItem('favoriteGroups', JSON.stringify(favoriteGroups));
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des favoris:', error);
    }
  }, [favoriteGroups]);

  // Charger les favoris depuis le stockage local au chargement
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('favoriteGroups');
      if (savedFavorites) {
        setFavoriteGroups(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error);
    }
  }, []);

  // Fonction pour gérer la pagination
  const paginatedGroups = useMemo(() => {
    const startIndex = (currentPage - 1) * groupsPerPage;
    return filteredGroups.slice(startIndex, startIndex + groupsPerPage);
  }, [filteredGroups, currentPage, groupsPerPage]);

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(filteredGroups.length / groupsPerPage);

  // Fonction pour changer de page
  const changePage = (pageNumber: number) => {
    setCurrentPage(Math.min(Math.max(1, pageNumber), totalPages));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fonction pour générer et ouvrir le QR code d'un groupe
  const handleShareViaQRCode = (group: any) => {
    setSelectedGroup(group);
    setIsQRModalOpen(true);
  };

  // Fonction pour activer/désactiver le mode hors ligne
  const toggleOfflineMode = useCallback(() => {
    if (showOfflineWarning) {
      // Désactiver le mode hors ligne
      setShowOfflineWarning(false);
      setOfflineCache([]);
    } else {
      // Activer le mode hors ligne et mettre en cache les données actuelles
      setShowOfflineWarning(true);
      setOfflineCache(groups);
      toast({
        title: "Mode hors ligne activé",
        description: "Les groupes sont maintenant disponibles même sans connexion",
      });
    }
  }, [groups, showOfflineWarning, toast]);

  // Surveillance de la connectivité réseau
  useEffect(() => {
    const handleOnline = () => {
      if (showOfflineWarning) {
        toast({
          title: "Connexion internet rétablie",
          description: "Synchronisation des données...",
        });
        fetchGroups(true);
      }
    };

    const handleOffline = () => {
      if (!showOfflineWarning && groups.length > 0) {
        setShowOfflineWarning(true);
        setOfflineCache(groups);
        toast({
          title: "Mode hors ligne activé automatiquement",
          description: "Connexion internet perdue. Les données sont disponibles hors ligne.",
          variant: "warning"
        });
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showOfflineWarning, groups, fetchGroups, toast]);

  // Fonction pour rafraîchir les groupes
  const handleRefresh = () => {
    fetchGroups(true);
  };

  // Fonction pour inviter des membres
  const handleInviteMembers = () => {
    setIsInviteModalOpen(true);
  };

  // Fonction pour gérer les changements de filtres avancés
  const handleAdvancedFilterChange = useCallback((filters) => {
    setAdvancedFilters(filters);
  }, []);

  // Filter and sort groups
  const getFilteredGroups = useCallback(() => {
    return groups.filter(group => {
      // Filtres de base
      const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !filterStatus || group.status === filterStatus;
      const matchesTab = activeTab === "all" ||
                        (activeTab === "active" && group.status === "active") ||
                        (activeTab === "pending" && group.status === "pending") ||
                        (activeTab === "completed" && group.status === "completed");

      // Filtres avancés
      const matchesTags = advancedFilters.tags.length === 0 ||
                         (group.tags && advancedFilters.tags.some(tag => group.tags?.includes(tag)));

      const matchesMembers =
        (!advancedFilters.minMembers || group.members >= advancedFilters.minMembers) &&
        (!advancedFilters.maxMembers || group.members <= advancedFilters.maxMembers);

      const matchesContribution =
        (!advancedFilters.minContribution || group.contribution >= advancedFilters.minContribution) &&
        (!advancedFilters.maxContribution || group.contribution <= advancedFilters.maxContribution);

      return matchesSearch && matchesStatus && matchesTab &&
             matchesTags && matchesMembers && matchesContribution;
    }).sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'amount') {
        return sortOrder === 'asc'
          ? a.contribution - b.contribution
          : b.contribution - a.contribution;
      } else {
        // Default to sorting by date (using id as proxy)
        return sortOrder === 'asc'
          ? String(a.id).localeCompare(String(b.id))
          : String(b.id).localeCompare(String(a.id));
      }
    });
  }, [groups, searchTerm, filterStatus, activeTab, sortBy, sortOrder, advancedFilters]);

  // Déclarer filteredGroups avant son utilisation
  const filteredGroups = getFilteredGroups();

  const handleCreateGroup = async (data: { name: string; contribution: string; frequency: string; members: string }) => {
    console.log("Group created with data:", data);

    // After group creation, refresh the groups list
    if (user) {
      setIsLoading(true);

      try {
        // Fetch all groups the user has access to (based on RLS policies)
        const { data: groupsData, error: groupsError } = await supabase
          .from('tontine_groups')
          .select('*');

        if (groupsError) {
          console.error("Error fetching groups after creation:", groupsError);
          throw groupsError;
        }

        console.log("Groups data after creation:", groupsData);

        if (groupsData && groupsData.length > 0) {
          // Transform the group data
          const newGroups = await Promise.all(groupsData.map(async (group) => {
            const startDate = new Date(group.start_date);

            // Get member count
            const { count } = await supabase
              .from('group_members')
              .select('*', { count: 'exact', head: true })
              .eq('group_id', group.id);

            // Calculate next due date
            let nextDue = new Date(startDate);
            const today = new Date();

            while (nextDue < today) {
              if (group.frequency === 'weekly') {
                nextDue.setDate(nextDue.getDate() + 7);
              } else if (group.frequency === 'biweekly') {
                nextDue.setDate(nextDue.getDate() + 14);
              } else {
                nextDue.setMonth(nextDue.getMonth() + 1);
              }
            }

            return {
              id: group.id,
              name: group.name,
              members: count || 1,
              contribution: group.contribution_amount,
              frequency: group.frequency,
              nextDue: nextDue.toLocaleDateString(),
              status: "active" as const,
              progress: 0
            };
          }));

          setGroups(newGroups);
        }
      } catch (error) {
        console.error('Error refreshing groups:', error);
        toast({
          title: "Error",
          description: "Error refreshing groups after creation",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatContribution = (amount: number, frequency: string) => {
    return `${formatAmount(amount)} / ${t(frequency as 'monthly' | 'weekly' | 'biweekly')}`;
  };

  const openGroupDetails = (groupId: string | number) => {
    // Navigate to group details page
    navigate(`/groups/${groupId}`);
  };

  const openWhatsAppIntegration = (group: any) => {
    setSelectedGroup(group);
    setIsWhatsAppModalOpen(true);
  };

  const toggleSort = (sortType: "name" | "date" | "amount") => {
    if (sortBy === sortType) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(sortType);
      setSortOrder('asc');
    }
  };

  // Fonction pour changer le statut d'un groupe (pour le glisser-déposer)
  const handleGroupStatusChange = useCallback(async (groupId: string | number, newStatus: "active" | "pending" | "completed") => {
    try {
      // Mettre à jour l'état local immédiatement pour une UI réactive
      setGroups(prevGroups =>
        prevGroups.map(group =>
          group.id === groupId
            ? { ...group, status: newStatus }
            : group
        )
      );

      // Dans une application réelle, vous mettriez à jour la base de données ici
      // Par exemple:
      // const { error } = await supabase
      //   .from('group_members')
      //   .update({ status: newStatus })
      //   .eq('group_id', groupId)
      //   .eq('user_id', user.id);

      // if (error) throw error;

      console.log(`Groupe ${groupId} mis à jour avec le statut: ${newStatus}`);

    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut du groupe",
        variant: "destructive"
      });

      // Annuler le changement en cas d'erreur
      fetchGroups();
    }
  }, [toast, fetchGroups]);

  // Sample members for the sidebar
  const sampleMembers = [
    { id: 1, name: "Alex Smith", status: "active" as const },
    { id: 2, name: "Jamie Williams", status: "pending" as const },
    { id: 3, name: "Taylor Johnson", status: "paid" as const },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <motion.h1
            className="text-3xl font-bold text-gray-900 dark:text-white flex items-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {t('yourGroups')}
            <button
              onClick={() => setIsInfoOpen(!isInfoOpen)}
              className="ml-2 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Information"
            >
              <Info size={18} />
            </button>
          </motion.h1>
          <motion.p
            className="mt-2 text-sm text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {t('manageGroups')}
          </motion.p>

          <AnimatePresence>
            {isInfoOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-3 p-4 bg-tontine-soft-green dark:bg-green-900/30 rounded-lg text-sm"
              >
                <p className="text-gray-700 dark:text-gray-300">
                  {t('groupsInfoText')}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          {/* Search and Filter */}
          <div className="flex flex-col max-w-md w-full space-y-2">
            <div className="flex items-center relative">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder={t('searchGroups')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="tontine-input pl-10 w-full"
                />
              </div>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="ml-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                aria-label="Filtres simples"
                title="Filtres simples"
              >
                <SlidersHorizontal size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="ml-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                aria-label="Filtres par tags"
                title="Filtres par tags"
              >
                <Tag size={20} className={`${advancedFilters.tags.length > 0 ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`} />
              </button>
            </div>

            {/* Filtres avancés */}
            <AdvancedFilters
              onFilterChange={handleAdvancedFilterChange}
              availableTags={availableTags}
            />

            {/* Afficher les tags sélectionnés */}
            {advancedFilters.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {advancedFilters.tags.map(tag => (
                  <TagBadge
                    key={tag}
                    tag={tag}
                    onRemove={() => {
                      const newTags = advancedFilters.tags.filter(t => t !== tag);
                      setAdvancedFilters({...advancedFilters, tags: newTags});
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* View Toggle and Create Group */}
          <div className="flex items-center space-x-2">
            {/* Notifications en temps réel */}
            <RealtimeNotifications />

            {/* Sélecteur de thème */}
            <ThemeToggle />

            {/* Exportation des données */}
            <ExportData groups={filteredGroups} />

            {/* Système de rappels */}
            <ReminderSystem groups={filteredGroups} />

            <button
              onClick={refreshGroups}
              className={`p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isRefreshing}
              aria-label="Rafraîchir"
            >
              <RefreshCw size={20} className={`text-gray-700 dark:text-gray-300 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-md">
              <button
                onClick={() => setView("grid")}
                className={`p-1.5 rounded-md ${view === "grid" ? "bg-white dark:bg-gray-700 shadow-sm" : "text-gray-500 dark:text-gray-400"}`}
                aria-label="Vue grille"
                title="Vue grille"
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-1.5 rounded-md ${view === "list" ? "bg-white dark:bg-gray-700 shadow-sm" : "text-gray-500 dark:text-gray-400"}`}
                aria-label="Vue liste"
                title="Vue liste"
              >
                <List size={20} />
              </button>
              <button
                onClick={() => setView("kanban")}
                className={`p-1.5 rounded-md ${view === "kanban" ? "bg-white dark:bg-gray-700 shadow-sm" : "text-gray-500 dark:text-gray-400"}`}
                aria-label="Vue kanban"
                title="Vue kanban"
              >
                <LayoutGrid size={20} />
              </button>
              <button
                onClick={() => setView("calendar")}
                className={`p-1.5 rounded-md ${view === "calendar" ? "bg-white dark:bg-gray-700 shadow-sm" : "text-gray-500 dark:text-gray-400"}`}
                aria-label="Vue calendrier"
                title="Vue calendrier"
              >
                <Calendar size={20} />
              </button>
            </div>
            <div className="flex space-x-2">
              <button
                className="tontine-button tontine-button-primary flex items-center"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus size={18} className="mr-2" />
                {t('createGroup')}
              </button>
              <button
                className="tontine-button flex items-center bg-green-600 hover:bg-green-700 text-white"
                onClick={() => setIsWhatsAppModalOpen(true)}
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                  alt="WhatsApp"
                  className="h-4 w-4 mr-2"
                />
                WhatsApp
              </button>
            </div>
          </div>
        </motion.div>

        {/* Filter Dropdown */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-wrap gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <Filter size={16} className="mr-1" />
                    {t('filterByStatus')}:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFilterStatus(null)}
                      className={`px-3 py-1 text-sm rounded-full ${!filterStatus ? 'bg-primary text-primary-foreground' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                    >
                      {t('all')}
                    </button>
                    <button
                      onClick={() => setFilterStatus('active')}
                      className={`px-3 py-1 text-sm rounded-full ${filterStatus === 'active' ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                    >
                      {t('active')}
                    </button>
                    <button
                      onClick={() => setFilterStatus('pending')}
                      className={`px-3 py-1 text-sm rounded-full ${filterStatus === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                    >
                      {t('pending')}
                    </button>
                    <button
                      onClick={() => setFilterStatus('completed')}
                      className={`px-3 py-1 text-sm rounded-full ${filterStatus === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                    >
                      {t('completed')}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <ArrowUpDown size={16} className="mr-1" />
                    {t('sortBy')}:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => toggleSort('name')}
                      className={`px-3 py-1 text-sm rounded-full flex items-center ${sortBy === 'name' ? 'bg-primary text-primary-foreground' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                    >
                      {t('name')}
                      {sortBy === 'name' && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => toggleSort('date')}
                      className={`px-3 py-1 text-sm rounded-full flex items-center ${sortBy === 'date' ? 'bg-primary text-primary-foreground' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                    >
                      {t('date')}
                      {sortBy === 'date' && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => toggleSort('amount')}
                      className={`px-3 py-1 text-sm rounded-full flex items-center ${sortBy === 'amount' ? 'bg-primary text-primary-foreground' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                    >
                      {t('amount')}
                      {sortBy === 'amount' && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tontine-purple"></div>
          </div>
        )}

        {/* Mode hors ligne */}
        {showOfflineWarning && (
          <div className="mb-4 p-3 flex items-center justify-between bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 rounded-md">
            <div className="flex items-center">
              <Clock size={18} className="mr-2" />
              <span>Mode hors ligne actif - Les données affichées peuvent ne pas être à jour</span>
            </div>
            <button 
              onClick={toggleOfflineMode} 
              className="text-sm underline hover:text-amber-700 dark:hover:text-amber-300"
            >
              Se reconnecter
            </button>
          </div>
        )}

        {/* Vue par onglets améliorée */}
        {!isLoading && (
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-5 mb-4 bg-gray-100 dark:bg-gray-800">
              <TabsTrigger value="all" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                Tous
              </TabsTrigger>
              <TabsTrigger value="active" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                Actifs
              </TabsTrigger>
              <TabsTrigger value="pending" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                En attente
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                Terminés
              </TabsTrigger>
              <TabsTrigger value="favorites" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                Favoris
              </TabsTrigger>
            </TabsList>

            {/* Vue principale pour tous les onglets sauf calendrier */}
            <TabsContent value="all">
              {filteredGroups.length === 0 ? (
                <motion.div
                  className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Users size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">{t('noGroupsFound')}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">{searchTerm || filterStatus ? t('noMatchingGroups') : t('createFirstGroup')}</p>
                  <button
                    className="tontine-button tontine-button-primary inline-flex items-center"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <Plus size={18} className="mr-2" />
                    {t('createGroup')}
                  </button>
                </motion.div>
              ) : (
                <>
                  {/* Nouveau sélecteur de vue avec calendrier */}
                  <div className="flex justify-end mb-4">
                    <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-md">
                      <button
                        onClick={() => setView("grid")}
                        className={`p-1.5 rounded-md ${view === "grid" ? "bg-white dark:bg-gray-700 shadow-sm" : "text-gray-500 dark:text-gray-400"}`}
                        aria-label="Vue grille"
                        title="Vue grille"
                      >
                        <Grid size={20} />
                      </button>
                      <button
                        onClick={() => setView("list")}
                        className={`p-1.5 rounded-md ${view === "list" ? "bg-white dark:bg-gray-700 shadow-sm" : "text-gray-500 dark:text-gray-400"}`}
                        aria-label="Vue liste"
                        title="Vue liste"
                      >
                        <List size={20} />
                      </button>
                      <button
                        onClick={() => setView("kanban")}
                        className={`p-1.5 rounded-md ${view === "kanban" ? "bg-white dark:bg-gray-700 shadow-sm" : "text-gray-500 dark:text-gray-400"}`}
                        aria-label="Vue kanban"
                        title="Vue kanban"
                      >
                        <LayoutGrid size={20} />
                      </button>
                      <button
                        onClick={() => setView("calendar")}
                        className={`p-1.5 rounded-md ${view === "calendar" ? "bg-white dark:bg-gray-700 shadow-sm" : "text-gray-500 dark:text-gray-400"}`}
                        aria-label="Vue calendrier"
                        title="Vue calendrier"
                      >
                        <Calendar size={20} />
                      </button>
                    </div>
                  </div>
                  
                  {view === "calendar" ? (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                      <h3 className="text-lg font-semibold mb-4">Calendrier des échéances</h3>
                      <div className="h-[500px]">
                        {/* Composant de calendrier (simulé) */}
                        <div className="grid grid-cols-7 gap-1">
                          {Array.from({ length: 31 }, (_, i) => (
                            <div key={i} className={`border p-2 min-h-[80px] ${i % 7 === 0 || i % 7 === 6 ? 'bg-gray-50 dark:bg-gray-700/50' : ''}`}>
                              <div className="font-medium">{i + 1}</div>
                              {i === 4 && (
                                <div className="mt-1 p-1 bg-green-100 dark:bg-green-900/30 text-xs rounded">
                                  Groupe Famille: 200€
                                </div>
                              )}
                              {i === 12 && (
                                <div className="mt-1 p-1 bg-blue-100 dark:bg-blue-900/30 text-xs rounded">
                                  Groupe Amis: 150€
                                </div>
                              )}
                              {i === 19 && (
                                <div className="mt-1 p-1 bg-purple-100 dark:bg-purple-900/30 text-xs rounded">
                                  Collègues: 100€
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Vue grille/liste/kanban */}
                      <div className="flex flex-col lg:flex-row gap-6">
                        {view !== "kanban" ? (
                          <motion.div
                            className={`${view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"} flex-1`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            {paginatedGroups.map((group, index) => (
                              <motion.div
                                key={group.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                whileHover={{ scale: view === "grid" ? 1.02 : 1 }}
                              >
                                <TontineGroup
                                  name={group.name}
                                  members={group.members}
                                  contribution={formatContribution(group.contribution, group.frequency)}
                                  nextDue={group.nextDue}
                                  status={group.status}
                                  progress={group.progress}
                                  tags={group.tags}
                                  onClick={() => openGroupDetails(group.id)}
                                  isFavorite={favoriteGroups.includes(String(group.id))}
                                  onToggleFavorite={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(group.id);
                                  }}
                                  actions={[
                                    {
                                      icon: <MessageSquare size={16} className="text-green-600" />,
                                      label: "WhatsApp",
                                      onClick: (e) => {
                                        e.stopPropagation();
                                        openWhatsAppIntegration(group);
                                      }
                                    },
                                    {
                                      icon: <QrCode size={16} className="text-blue-600" />,
                                      label: "QR Code",
                                      onClick: (e) => {
                                        e.stopPropagation();
                                        handleShareViaQRCode(group);
                                      }
                                    },
                                    {
                                      icon: favoriteGroups.includes(String(group.id)) 
                                        ? <StarOff size={16} className="text-yellow-600" />
                                        : <Star size={16} className="text-yellow-600" />,
                                      label: favoriteGroups.includes(String(group.id)) ? "Retirer des favoris" : "Ajouter aux favoris",
                                      onClick: (e) => {
                                        e.stopPropagation();
                                        toggleFavorite(group.id);
                                      }
                                    }
                                  ]}
                                />
                              </motion.div>
                            ))}
                          </motion.div>
                        ) : (
                          <KanbanView
                            groups={paginatedGroups}
                            onGroupStatusChange={handleGroupStatusChange}
                            formatContribution={formatContribution}
                            onCardClick={openGroupDetails}
                            onWhatsAppClick={openWhatsAppIntegration}
                            favoriteGroups={favoriteGroups}
                            onToggleFavorite={toggleFavorite}
                            onShareViaQRCode={handleShareViaQRCode}
                          />
                        )}

                        {/* Recent Members Sidebar (only shown on larger screens) */}
                        <div className="hidden lg:block w-80">
                          <div className="sticky top-24">
                            <MemberList
                              members={sampleMembers}
                              title={t('recentMembers')}
                              maxDisplay={5}
                              compact={true}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Pagination */}
                      {filteredGroups.length > groupsPerPage && (
                        <div className="flex justify-center mt-8">
                          <nav className="inline-flex rounded-md shadow">
                            <button
                              onClick={() => changePage(currentPage - 1)}
                              disabled={currentPage === 1}
                              className={`px-3 py-1 rounded-l-md border border-gray-300 text-sm font-medium 
                                ${currentPage === 1 
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                  : 'bg-white hover:bg-gray-50 text-gray-700'}`}
                            >
                              Précédent
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                              <button
                                key={page}
                                onClick={() => changePage(page)}
                                className={`px-3 py-1 border-t border-b border-gray-300 text-sm font-medium 
                                  ${currentPage === page 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'bg-white hover:bg-gray-50 text-gray-700'}`}
                              >
                                {page}
                              </button>
                            ))}
                            <button
                              onClick={() => changePage(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className={`px-3 py-1 rounded-r-md border border-gray-300 text-sm font-medium 
                                ${currentPage === totalPages 
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                  : 'bg-white hover:bg-gray-50 text-gray-700'}`}
                            >
                              Suivant
                            </button>
                          </nav>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="active">
              {/* Contenu identique à "all" mais avec filtreStatus="active" */}
            </TabsContent>

            <TabsContent value="pending">
              {/* Contenu identique à "all" mais avec filtreStatus="pending" */}
            </TabsContent>

            <TabsContent value="completed">
              {/* Contenu identique à "all" mais avec filtreStatus="completed" */}
            </TabsContent>
            
            <TabsContent value="favorites">
              {favoriteGroups.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <Star size={48} className="mx-auto text-yellow-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Aucun groupe favori</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">Ajoutez des groupes à vos favoris pour les retrouver rapidement</p>
                </div>
              ) : (
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {filteredGroups
                    .filter(group => favoriteGroups.includes(String(group.id)))
                    .map((group, index) => (
                      <motion.div
                        key={group.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <TontineGroup
                          name={group.name}
                          members={group.members}
                          contribution={formatContribution(group.contribution, group.frequency)}
                          nextDue={group.nextDue}
                          status={group.status}
                          progress={group.progress}
                          tags={group.tags}
                          onClick={() => openGroupDetails(group.id)}
                          isFavorite={true}
                          onToggleFavorite={(e) => {
                            e.stopPropagation();
                            toggleFavorite(group.id);
                          }}
                          actions={[
                            {
                              icon: <MessageSquare size={16} className="text-green-600" />,
                              label: "WhatsApp",
                              onClick: (e) => {
                                e.stopPropagation();
                                openWhatsAppIntegration(group);
                              }
                            },
                            {
                              icon: <QrCode size={16} className="text-blue-600" />,
                              label: "QR Code",
                              onClick: (e) => {
                                e.stopPropagation();
                                handleShareViaQRCode(group);
                              }
                            },
                            {
                              icon: <StarOff size={16} className="text-yellow-600" />,
                              label: "Retirer des favoris",
                              onClick: (e) => {
                                e.stopPropagation();
                                toggleFavorite(group.id);
                              }
                            }
                          ]}
                        />
                      </motion.div>
                    ))}
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>

      <CreateGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateGroup}
      />

      {/* WhatsApp Integration Modal */}
      <Dialog open={isWhatsAppModalOpen} onOpenChange={setIsWhatsAppModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedGroup ?
                `${t('whatsAppIntegration')}: ${selectedGroup.name}` :
                t('whatsAppIntegration')}
            </DialogTitle>
          </DialogHeader>
          <WhatsAppIntegration
            groupName={selectedGroup?.name || "Naat Group"}
            groupDescription={`${t('contribution')}: ${selectedGroup ? formatContribution(selectedGroup.contribution, selectedGroup.frequency) : ''}`}
            groupId={selectedGroup?.id}
          />
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      <Dialog open={isQRModalOpen} onOpenChange={setIsQRModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedGroup ? `Partager "${selectedGroup.name}" via QR Code` : "Partager le groupe"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="bg-white p-4 rounded-lg">
              {/* QR Code simulé - dans une implémentation réelle, utilisez une bibliothèque comme qrcode.react */}
              <div className="w-64 h-64 bg-gray-200 flex items-center justify-center">
                <QrCode size={80} className="text-gray-800" />
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
              Scannez ce code QR avec votre appareil mobile pour rejoindre ce groupe de tontine
            </p>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => setIsQRModalOpen(false)}>Fermer</Button>
              <Button variant="outline" className="flex items-center">
                <Download size={16} className="mr-2" />
                Télécharger
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Centre de notifications */}
      <Dialog open={isNotificationCenterOpen} onOpenChange={setIsNotificationCenterOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <BellRing size={18} className="mr-2 text-primary" />
              Centre de notifications
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded">
              <p className="text-sm font-medium text-green-800 dark:text-green-300">Paiement confirmé</p>
              <p className="text-xs text-green-700 dark:text-green-400">Groupe "Famille" - Hier</p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Rappel de contribution</p>
              <p className="text-xs text-amber-700 dark:text-amber-400">Groupe "Amis" - Paiement attendu dans 3 jours</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Nouveau membre</p>
              <p className="text-xs text-blue-700 dark:text-blue-400">Sarah a rejoint "Collègues" - Il y a 2 jours</p>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="outline" className="w-full" onClick={() => setIsNotificationCenterOpen(false)}>
              Marquer tout comme lu
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Persistent Chat */}
      <PersistentChat />
    </div>
  );
};

export default Groups;
