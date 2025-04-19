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
      case "active": return "bg-primary/10 text-primary";
      case "pending": return "bg-muted text-muted-foreground";
      case "completed": return "bg-accent text-accent-foreground";
    }
  };

  return (
    <motion.div
      className={`tontine-card rounded-xl p-4 ${getStatusColor()}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{name}</h3>
            <div className="flex items-center mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor()}`}>
                {t(status)}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Users size={16} className="text-primary" />
            <span className="text-sm text-muted-foreground">{members}</span>
          </div>
        </div>

        {progress > 0 && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-muted-foreground">{t('progress')}</span>
              <span className="text-xs font-medium text-foreground">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  progress < 30 ? "bg-yellow-500" :
                  progress < 70 ? "bg-primary" :
                  "bg-green-500"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col space-y-3">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center mr-3">
              <Coins size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('contribution')}</p>
              <p className="font-medium text-foreground">{contribution}</p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center mr-3">
              <CalendarIcon size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('nextDue')}</p>
              <p className="font-medium text-foreground">{nextDue}</p>
            </div>
          </div>

          {status === "active" && (
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center mr-3">
                <TrendingUp size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('payoutStatus')}</p>
                <p className="font-medium text-foreground">{progress < 100 ? t('upcoming') : t('ready')}</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-right">
          <ChevronRight size={18} className="inline-block text-muted-foreground" />
        </div>
      </div>
    </motion.div>
  );
}
