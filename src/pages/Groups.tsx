
import { useState, useEffect } from "react";
import { Plus, Search, Filter, SlidersHorizontal, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import TontineGroup from "@/components/TontineGroup";
import CreateGroupModal from "@/components/CreateGroupModal";
import { useApp } from "@/contexts/AppContext";

// Mock data - this would typically come from an API
const mockGroups = [
  { 
    id: 1, 
    name: "Family Savings", 
    members: 8, 
    contribution: 50, 
    frequency: "monthly", 
    nextDue: "Jun 15, 2023",
    status: "active" as const,
    progress: 45
  },
  { 
    id: 2, 
    name: "Friends Circle", 
    members: 5, 
    contribution: 100, 
    frequency: "monthly", 
    nextDue: "Jun 22, 2023",
    status: "pending" as const,
    progress: 30
  },
  { 
    id: 3, 
    name: "Business Collective", 
    members: 12, 
    contribution: 200, 
    frequency: "monthly", 
    nextDue: "Jul 1, 2023",
    status: "active" as const,
    progress: 75
  },
  { 
    id: 4, 
    name: "Neighborhood Fund", 
    members: 6, 
    contribution: 75, 
    frequency: "biweekly", 
    nextDue: "Jun 18, 2023",
    status: "completed" as const,
    progress: 100
  },
  { 
    id: 5, 
    name: "School Parents", 
    members: 15, 
    contribution: 25, 
    frequency: "weekly", 
    nextDue: "Jun 10, 2023",
    status: "active" as const,
    progress: 60
  },
];

const Groups = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const { t, formatAmount } = useApp();
  const navigate = useNavigate();

  // Filter groups based on search and status
  const filteredGroups = mockGroups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || group.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateGroup = (data: { name: string; contribution: string; frequency: string; members: string }) => {
    console.log("Creating new group:", data);
    // Here you would normally send this data to your backend
    setIsModalOpen(false);
  };

  const formatContribution = (amount: number, frequency: string) => {
    return `${formatAmount(amount)} / ${t(frequency as 'monthly' | 'weekly' | 'biweekly')}`;
  };

  const openGroupDetails = (groupId: number) => {
    // Navigate to group details page
    console.log(`Navigating to group ${groupId} details`);
    // navigate(`/groups/${groupId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <motion.h1 
            className="text-3xl font-bold text-gray-900 dark:text-white"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {t('yourGroups')}
          </motion.h1>
          <motion.p 
            className="mt-2 text-sm text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {t('manageGroups')}
          </motion.p>
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
              <div className="flex flex-wrap gap-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2 flex items-center">
                  <Filter size={16} className="mr-1" />
                  {t('filterByStatus')}:
                </p>
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Groups List / Grid */}
        {filteredGroups.length === 0 ? (
          <motion.div 
            className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Users size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">{t('noGroupsFound')}</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">{searchTerm ? t('noMatchingGroups') : t('createFirstGroup')}</p>
            <button 
              className="tontine-button tontine-button-primary inline-flex items-center"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={18} className="mr-2" />
              {t('createGroup')}
            </button>
          </motion.div>
        ) : (
          <motion.div 
            className={`grid ${view === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"} gap-6`}
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
                whileHover={{ scale: 1.02 }}
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
        )}

        {/* Group Stats */}
        {filteredGroups.length > 0 && (
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
