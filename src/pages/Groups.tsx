import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from "react";
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
  ChevronLeft,
  ChevronRight,
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
import VirtualizedGroupList from "@/components/VirtualizedGroupList";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMediaQuery } from "@/hooks/use-media-query";
import PersistentChat from "@/components/PersistentChat";
import { Group } from "@/types/group";
import { useUserGroups, useInfiniteGroups, useCreateGroup, useUpdateGroup } from "@/hooks/useGroupsQuery";

const Groups = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [view, setView] = useState<"grid" | "list" | "kanban" | "calendar">("grid");
  const [sortBy, setSortBy] = useState<"name" | "date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
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
  const [advancedFilters, setAdvancedFilters] = useState({
    tags: [] as string[],
    minMembers: null as number | null,
    maxMembers: null as number | null,
    minContribution: null as number | null,
    maxContribution: null as number | null
  });

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

  // Use React Query to fetch groups
  const {
    data: groupsData,
    isLoading,
    isError,
    refetch
  } = useUserGroups(user?.id, {
    enabled: !!user,
    onSuccess: (data) => {
      console.log("Groups data fetched successfully:", data);
    },
    onError: (error) => {
      console.error("Error fetching groups:", error);
      toast({
        title: "Error",
        description: "Error fetching groups",
        variant: "destructive"
      });
    }
  });

  // Use React Query for infinite loading
  const {
    data: infiniteGroupsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingInfinite
  } = useInfiniteGroups(user?.id, 20, {
    enabled: !!user && view !== "kanban" && view !== "calendar",
  });

  // Use React Query for creating groups
  const { mutate: createGroupMutation, isLoading: isCreating } = useCreateGroup();

  // Process groups data from React Query
  const groups = useMemo(() => {
    if (!groupsData?.data) return [];

    return groupsData.data.map(group => {
      // Calculate next due date based on frequency and start date
      const startDate = new Date(group.start_date);
      const nextDue = new Date(startDate);
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
        members: group.member_count || 1,
        contribution: group.contribution_amount,
        frequency: group.frequency,
        nextDue: nextDue.toLocaleDateString(),
        status: group.status || "active" as "active" | "pending" | "completed",
        progress: progress || 0,
        tags: randomTags
      };
    });
  }, [groupsData]);

  // Process infinite query data for virtualized list
  const allInfiniteGroups = useMemo(() => {
    if (!infiniteGroupsData?.pages) return [];

    return infiniteGroupsData.pages.flatMap(page =>
      page.data.map(group => {
        // Calculate next due date based on frequency and start date
        const startDate = new Date(group.start_date);
        const nextDue = new Date(startDate);
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
          members: group.member_count || 1,
          contribution: group.contribution_amount,
          frequency: group.frequency,
          nextDue: nextDue.toLocaleDateString(),
          status: group.status || "active" as "active" | "pending" | "completed",
          progress: progress || 0,
          tags: randomTags
        };
      })
    );
  }, [infiniteGroupsData]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refetch();
    toast({
      title: "Refreshing",
      description: "Refreshing groups data...",
    });
  }, [refetch, toast]);

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
  const handleShareViaQRCode = (group: Group) => {
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
        refetch();
      }
    };

    const handleOffline = () => {
      if (!showOfflineWarning && groups.length > 0) {
        setShowOfflineWarning(true);
        setOfflineCache(groups);
        toast({
          title: "Mode hors ligne activé automatiquement",
          description: "Connexion internet perdue. Les données sont disponibles hors ligne.",
        });
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showOfflineWarning, groups, refetch, toast]);

  // Fonction pour inviter des membres
  const handleInviteMembers = () => {
    setIsInviteModalOpen(true);
  };

  // Fonction pour gérer les changements de filtres avancés
  const handleAdvancedFilterChange = useCallback((filters) => {
    setAdvancedFilters(filters);
  }, []);

  // Fonction pour rafraîchir les groupes
  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing",
      description: "Refreshing groups data...",
    });
  };

  const handleCreateGroup = async (formData: { name: string; contribution: string; frequency: string; members: string }) => {
    console.log("Group created with data:", formData);

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a group",
        variant: "destructive"
      });
      return;
    }

    try {
      // Parse the contribution amount
      const contributionAmount = parseFloat(formData.contribution);

      // Create a start date (today)
      const startDate = new Date().toISOString();

      // Prepare the group data
      const groupData = {
        name: formData.name,
        contribution_amount: contributionAmount,
        frequency: formData.frequency as 'weekly' | 'biweekly' | 'monthly',
        start_date: startDate,
        payout_method: 'rotation' as 'rotation' | 'random' | 'bidding',
        created_by: user.id
      };

      // Use React Query mutation to create the group
      createGroupMutation(groupData, {
        onSuccess: (data) => {
          console.log("Group created successfully:", data);
          toast({
            title: "Success",
            description: "Group created successfully",
          });

          // Close the modal
          setIsModalOpen(false);

          // Refresh the groups list
          refetch();
        },
        onError: (error) => {
          console.error("Error creating group:", error);
          toast({
            title: "Error",
            description: "Error creating group",
            variant: "destructive"
          });
        }
      });
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error",
        description: "Error creating group",
        variant: "destructive"
      });
    }
  };

  const formatContribution = (amount: number, frequency: string) => {
    return `${formatAmount(amount)} / ${t(frequency as 'monthly' | 'weekly' | 'biweekly')}`;
  };

  const openGroupDetails = (groupId: string | number) => {
    // Navigate to group details page
    navigate(`/groups/${groupId}`);
  };

  const openWhatsAppIntegration = (group: Group) => {
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

  // Use React Query for updating group status
  const { mutate: updateGroupStatus } = useUpdateGroup();

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
      console.log(`Groupe ${groupId} mis à jour avec le statut: ${newStatus}`);

      // Simuler une mise à jour avec React Query
      setTimeout(() => {
        toast({
          title: "Statut mis à jour",
          description: `Le groupe a été déplacé vers "${t(newStatus)}"`,
        });
      }, 500);

    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut du groupe",
        variant: "destructive"
      });

      // Annuler le changement en cas d'erreur
      refetch();
    }
  }, [toast, t, refetch]);

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
              onClick={handleRefresh}
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
                    <CalendarView
                      groups={filteredGroups}
                      onGroupClick={openGroupDetails}
                      formatContribution={formatContribution}
                    />
                  ) : (
                    <>
                      {/* Vue grille/liste/kanban */}
                      <div className="flex flex-col lg:flex-row gap-6">
                        {view !== "kanban" ? (
                          <div className="flex-1">
                            {/* Use virtualized list for better performance */}
                            {view === "grid" || view === "list" ? (
                              <VirtualizedGroupList
                                groups={filteredGroups}
                                isLoading={isLoading}
                                isFetchingNextPage={isFetchingNextPage}
                                hasNextPage={hasNextPage}
                                fetchNextPage={fetchNextPage}
                                formatContribution={formatContribution}
                                onGroupClick={openGroupDetails}
                                onWhatsAppClick={openWhatsAppIntegration}
                                onToggleFavorite={toggleFavorite}
                                onShareViaQRCode={handleShareViaQRCode}
                                favoriteGroups={favoriteGroups}
                                view={view}
                              />
                            ) : (
                              <motion.div
                                className={`${view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"} flex-1`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                              >
                                {paginatedGroups.map((group: Group, index: number) => (
                                  <motion.div
                                    key={group.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                  >
                                    <TontineGroup
                                      id={group.id}
                                      name={group.name}
                                      members={group.members}
                                      contribution={formatContribution(group.contribution, group.frequency)}
                                      nextDue={group.nextDue}
                                      status={group.status}
                                      progress={group.progress}
                                      tags={group.tags}
                                      onClick={() => openGroupDetails(group.id)}
                                      isFavorite={favoriteGroups.includes(String(group.id))}
                                      onToggleFavorite={() => toggleFavorite(group.id)}
                                      onWhatsAppClick={() => openWhatsAppIntegration(group)}
                                      onShareViaQRCode={() => handleShareViaQRCode(group)}
                                      variant={view === "list" ? "minimal" : "modern"}
                                      compact={view === "list"}
                                      className={view === "list" ? "mb-2" : ""}
                                    />
                                  </motion.div>
                                ))}
                              </motion.div>
                            )}
                          </div>
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

                      {/* Pagination améliorée */}
                      {filteredGroups.length > groupsPerPage && (
                        <motion.div
                          className="flex justify-center mt-8"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                        >
                          <nav className="inline-flex rounded-lg shadow-sm overflow-hidden">
                            <button
                              onClick={() => changePage(currentPage - 1)}
                              disabled={currentPage === 1}
                              className={`px-4 py-2 border border-gray-200 dark:border-gray-700 text-sm font-medium transition-colors
                                ${currentPage === 1
                                  ? 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                  : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                              aria-label="Page précédente"
                            >
                              <ChevronLeft size={16} />
                            </button>

                            {/* Afficher les numéros de page avec ellipsis pour les grandes paginations */}
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                              .filter(page => {
                                // Toujours afficher la première et la dernière page
                                if (page === 1 || page === totalPages) return true;
                                // Afficher les pages autour de la page courante
                                if (Math.abs(page - currentPage) <= 1) return true;
                                // Sinon, ne pas afficher
                                return false;
                              })
                              .map((page, index, array) => {
                                // Ajouter des ellipsis si nécessaire
                                const showEllipsisBefore = index > 0 && array[index - 1] !== page - 1;
                                const showEllipsisAfter = index < array.length - 1 && array[index + 1] !== page + 1;

                                return (
                                  <React.Fragment key={page}>
                                    {showEllipsisBefore && (
                                      <span className="px-4 py-2 border-t border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                        ...
                                      </span>
                                    )}

                                    <button
                                      onClick={() => changePage(page)}
                                      className={`px-4 py-2 border-t border-b border-gray-200 dark:border-gray-700 text-sm font-medium transition-colors
                                        ${currentPage === page
                                          ? 'bg-primary text-primary-foreground'
                                          : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                                      aria-label={`Page ${page}`}
                                      aria-current={currentPage === page ? 'page' : undefined}
                                    >
                                      {page}
                                    </button>

                                    {showEllipsisAfter && (
                                      <span className="px-4 py-2 border-t border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                        ...
                                      </span>
                                    )}
                                  </React.Fragment>
                                );
                              })}

                            <button
                              onClick={() => changePage(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className={`px-4 py-2 border border-gray-200 dark:border-gray-700 text-sm font-medium transition-colors
                                ${currentPage === totalPages
                                  ? 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                  : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                              aria-label="Page suivante"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </nav>
                        </motion.div>
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
                    .filter((group: Group) => favoriteGroups.includes(String(group.id)))
                    .map((group: Group, index: number) => (
                      <motion.div
                        key={group.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <TontineGroup
                          id={group.id}
                          name={group.name}
                          members={group.members}
                          contribution={formatContribution(group.contribution, group.frequency)}
                          nextDue={group.nextDue}
                          status={group.status}
                          progress={group.progress}
                          tags={group.tags}
                          onClick={() => openGroupDetails(group.id)}
                          isFavorite={true}
                          onToggleFavorite={() => toggleFavorite(group.id)}
                          onWhatsAppClick={() => openWhatsAppIntegration(group)}
                          onShareViaQRCode={() => handleShareViaQRCode(group)}
                          variant="modern"
                          className="h-full"
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
