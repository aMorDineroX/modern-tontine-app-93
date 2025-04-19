import { CalendarIcon, Coins, Users, ChevronRight, TrendingUp } from "lucide-react";
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
      case "active": return "bg-tontine-green-100 text-tontine-green-700";
      case "pending": return "bg-tontine-green-50 text-tontine-green-600";
      case "completed": return "bg-tontine-green-200 text-tontine-green-800";
    }
  };

  return (
    <motion.div 
      className={`rounded-xl p-4 ${getStatusColor()} green-card`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4">
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
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">{t('progress')}</span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  progress < 30 ? "bg-yellow-500 dark:bg-yellow-600" :
                  progress < 70 ? "bg-tontine-purple dark:bg-tontine-light-purple" :
                  "bg-green-500 dark:bg-green-600"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
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
          
          {status === "active" && (
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-tontine-soft-purple dark:bg-purple-900/50 flex items-center justify-center mr-3">
                <TrendingUp size={16} className="text-tontine-dark-purple dark:text-tontine-light-purple" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('payoutStatus')}</p>
                <p className="font-medium dark:text-white">{progress < 100 ? t('upcoming') : t('ready')}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 text-right">
          <ChevronRight size={18} className="inline-block text-gray-400" />
        </div>
      </div>
    </motion.div>
  );
}
