import { useState, useEffect } from "react";
import { Plus, Search, Filter, SlidersHorizontal, Users, Info, ArrowUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import TontineGroup from "@/components/TontineGroup";
import CreateGroupModal from "@/components/CreateGroupModal";
import MemberList from "@/components/MemberList";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { supabase, fetchUserGroups } from "@/utils/supabase";
import { useAuth } from "@/contexts/AuthContext";

// Group type definition
type Group = {
  id: string | number;
  name: string;
  members: number;
  contribution: number;
  frequency: string;
  nextDue: string;
  status: "active" | "pending" | "completed";
  progress: number;
};

const Groups = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"name" | "date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const { t, formatAmount } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch groups from the database
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching groups, user:", user);

        if (!user) {
          setGroups([]);
          setIsLoading(false);
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

            return {
              id: group.id,
              name: group.name,
              members: count || 1,  // Default to 1 if count is null
              contribution: group.contribution_amount,
              frequency: group.frequency,
              nextDue: nextDue.toLocaleDateString(),
              status: status as "active" | "pending" | "completed",
              progress: progress || 0
            };
          })
        );

        console.log("Processed groups:", groupsWithMemberCount);
        setGroups(groupsWithMemberCount);
      } catch (error) {
        console.error('Error fetching groups:', error);
        toast({
          title: "Error",
          description: "Error fetching groups",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, [user, toast]);

  // Filter and sort groups
  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || group.status === filterStatus;
    return matchesSearch && matchesStatus;
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

  const toggleSort = (sortType: "name" | "date" | "amount") => {
    if (sortBy === sortType) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(sortType);
      setSortOrder('asc');
    }
  };

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
                className="mt-3 p-4 bg-tontine-soft-purple dark:bg-purple-900/30 rounded-lg text-sm"
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
          <div className="flex flex-1 max-w-md items-center relative">
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
            >
              <SlidersHorizontal size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* View Toggle and Create Group */}
          <div className="flex items-center space-x-2">
            <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-md">
              <button
                onClick={() => setView("grid")}
                className={`p-1.5 rounded-md ${view === "grid" ? "bg-white dark:bg-gray-700 shadow-sm" : "text-gray-500 dark:text-gray-400"}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-1.5 rounded-md ${view === "list" ? "bg-white dark:bg-gray-700 shadow-sm" : "text-gray-500 dark:text-gray-400"}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              </button>
            </div>
            <button
              className="tontine-button tontine-button-primary flex items-center"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={18} className="mr-2" />
              {t('createGroup')}
            </button>
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
                      className={`px-3 py-1 text-sm rounded-full ${!filterStatus ? 'bg-tontine-purple text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
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
                      className={`px-3 py-1 text-sm rounded-full flex items-center ${sortBy === 'name' ? 'bg-tontine-purple text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
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
                      className={`px-3 py-1 text-sm rounded-full flex items-center ${sortBy === 'date' ? 'bg-tontine-purple text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
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
                      className={`px-3 py-1 text-sm rounded-full flex items-center ${sortBy === 'amount' ? 'bg-tontine-purple text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
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

        {/* Empty State */}
        {!isLoading && filteredGroups.length === 0 && (
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
        )}

        {/* Groups Display (Grid or List) */}
        {!isLoading && filteredGroups.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-6">
            <motion.div
              className={`${view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"} flex-1`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {filteredGroups.map((group, index) => (
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
                    onClick={() => openGroupDetails(group.id)}
                  />
                </motion.div>
              ))}
            </motion.div>

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
        )}

        {/* Group Stats */}
        {!isLoading && filteredGroups.length > 0 && (
          <motion.div
            className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <h3 className="text-lg font-semibold mb-4 dark:text-white">{t('groupSummary')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-tontine-soft-purple dark:bg-purple-900/30 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('totalGroups')}</p>
                <p className="text-2xl font-semibold text-tontine-dark-purple dark:text-tontine-light-purple">
                  {filteredGroups.length}
                </p>
              </div>
              <div className="p-4 bg-tontine-soft-green dark:bg-green-900/30 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('activeGroups')}</p>
                <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
                  {filteredGroups.filter(g => g.status === 'active').length}
                </p>
              </div>
              <div className="p-4 bg-tontine-soft-blue dark:bg-blue-900/30 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('totalMembers')}</p>
                <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                  {filteredGroups.reduce((acc, group) => acc + group.members, 0)}
                </p>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('avgContribution')}</p>
                <p className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">
                  {formatAmount(Math.round(filteredGroups.reduce((acc, group) => acc + group.contribution, 0) / filteredGroups.length))}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      <CreateGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateGroup}
      />
    </div>
  );
};

export default Groups;
