
import { User, UserPlus, Share2, Check, Clock, AlertCircle } from "lucide-react";
import { useRef, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import WhatsAppShare from "./WhatsAppShare";
import { useVirtualizer } from '@tanstack/react-virtual';
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Button } from "./ui/button";

type Member = {
  id: number;
  name: string;
  image?: string;
  status: "active" | "pending" | "paid";
};

type MemberListProps = {
  members: Member[];
  title: string;
  maxDisplay?: number;
  compact?: boolean;
  showShareButton?: boolean;
  onInvite?: () => void;
};

export default function MemberList({
  members,
  title,
  maxDisplay,
  compact = false,
  showShareButton = true,
  onInvite
}: MemberListProps) {
  const { t } = useApp();
  const parentRef = useRef(null);
  const [hoveredMember, setHoveredMember] = useState<number | null>(null);

  const rowVirtualizer = useVirtualizer({
    count: members.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => compact ? 60 : 80,
  });

  const getStatusText = (status: "active" | "pending" | "paid") => {
    switch(status) {
      case "active": return t('active');
      case "pending": return t('pending');
      case "paid": return t('paid');
      default: return '';
    }
  };

  const getStatusIcon = (status: "active" | "pending" | "paid") => {
    switch(status) {
      case "active": return <Check size={14} className="mr-1 text-green-500" />;
      case "pending": return <Clock size={14} className="mr-1 text-yellow-500" />;
      case "paid": return <Check size={14} className="mr-1 text-primary" />;
      default: return <AlertCircle size={14} className="mr-1 text-gray-500" />;
    }
  };

  return (
    <motion.div
      className={`tontine-card ${compact ? 'p-3' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <span className="text-xs px-2 py-0.5 bg-primary/10 rounded-full text-primary font-medium">
          {members.length} {t('members')}
        </span>
      </div>

      {members.length === 0 ? (
        <div className="py-8 text-center">
          <User size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('noMembers')}</p>
          {onInvite && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={onInvite}
            >
              <UserPlus size={14} className="mr-1" />
              {t('inviteMembers')}
            </Button>
          )}
        </div>
      ) : (
        <div ref={parentRef} className="overflow-auto max-h-[400px] scrollbar-thin">
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const member = members[virtualRow.index];
              return (
                <motion.div
                  key={virtualRow.index}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: virtualRow.index * 0.05 }}
                  onMouseEnter={() => setHoveredMember(member.id)}
                  onMouseLeave={() => setHoveredMember(null)}
                >
                  <div className={`flex items-center justify-between ${compact ? 'p-1.5' : 'p-2'} hover:bg-secondary/50 rounded-lg transition-colors`}>
                    <div className="flex items-center">
                      <div className={`${compact ? 'w-7 h-7' : 'w-8 h-8'} rounded-full bg-secondary flex items-center justify-center mr-2 overflow-hidden`}>
                        {member.image ? (
                          <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <User size={compact ? 14 : 16} className="text-muted-foreground" />
                        )}
                      </div>
                      <span className="font-medium text-sm text-foreground">{member.name}</span>
                    </div>

                    <div className="flex items-center">
                      <AnimatePresence>
                        {hoveredMember === member.id && (
                          <motion.div
                            className="flex mr-2"
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <Share2 size={14} className="text-primary" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{t('shareContact')}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <span className={`text-xs flex items-center ${compact ? 'px-1.5 py-0.5' : 'px-2 py-1'} rounded-full ${
                        member.status === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : member.status === "pending"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-primary/10 text-primary"
                      }`}>
                        {getStatusIcon(member.status)}
                        {getStatusText(member.status)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {showShareButton && members.length > 0 && (
        <div className="mt-3 flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
          {onInvite && (
            <Button
              variant="outline"
              size="sm"
              onClick={onInvite}
            >
              <UserPlus size={14} className="mr-1" />
              {t('invite')}
            </Button>
          )}
          <WhatsAppShare
            text={`Rejoins notre groupe "${title}" sur Naat !`}
          />
        </div>
      )}
    </motion.div>
  );
}
