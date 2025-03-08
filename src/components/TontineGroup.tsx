
import { CalendarIcon, Coins, Users, ChevronRight } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { motion } from "framer-motion";

type TontineGroupProps = {
  name: string;
  members: number;
  contribution: string;
  nextDue: string;
  status?: "active" | "pending" | "completed";
  progress?: number;
  onClick?: () => void;
};

export default function TontineGroup({ 
  name, 
  members, 
  contribution, 
  nextDue, 
  status = "active",
  progress = 0,
  onClick 
}: TontineGroupProps) {
  const { t } = useApp();
  
  const getStatusColor = () => {
    switch(status) {
      case "active": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "pending": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "completed": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };
  
  return (
    <motion.div 
      className="tontine-card hover:shadow-md transition-all dark:bg-gray-800 dark:border-gray-700 cursor-pointer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold dark:text-white">{name}</h3>
          <div className="flex items-center mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor()}`}>
              {t(status)}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Users size={16} className="text-tontine-dark-purple dark:text-tontine-light-purple" />
          <span className="text-sm text-gray-600 dark:text-gray-400">{members}</span>
        </div>
      </div>
      
      {progress > 0 && (
        <div className="mb-4">
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-tontine-purple dark:bg-tontine-light-purple rounded-full" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-right mt-1 text-gray-500 dark:text-gray-400">
            {progress}% {t('complete')}
          </p>
        </div>
      )}
      
      <div className="flex flex-col space-y-3">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-tontine-soft-blue dark:bg-blue-900/50 flex items-center justify-center mr-3">
            <Coins size={16} className="text-tontine-dark-purple dark:text-tontine-light-purple" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('contribution')}</p>
            <p className="font-medium dark:text-white">{contribution}</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-tontine-soft-green dark:bg-green-900/50 flex items-center justify-center mr-3">
            <CalendarIcon size={16} className="text-tontine-dark-purple dark:text-tontine-light-purple" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('nextDue')}</p>
            <p className="font-medium dark:text-white">{nextDue}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-right">
        <ChevronRight size={18} className="inline-block text-gray-400" />
      </div>
    </motion.div>
  );
}
