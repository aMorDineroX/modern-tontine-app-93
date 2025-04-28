
import { User } from "lucide-react";
import { useRef } from "react";
import { useApp } from "@/contexts/AppContext";
import WhatsAppShare from "./WhatsAppShare";
import { useVirtualizer } from '@tanstack/react-virtual';

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
};

export default function MemberList({
  members,
  title,
  maxDisplay,
  compact = false,
  showShareButton = true
}: MemberListProps) {
  const { t } = useApp();
  const parentRef = useRef(null);

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

  return (
    <div className={`tontine-card animate-slide-up ${compact ? 'p-3' : ''}`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <span className="text-xs px-2 py-0.5 bg-secondary rounded-full text-primary">
          {members.length} {t('members')}
        </span>
      </div>

      <div ref={parentRef} className="overflow-auto max-h-[400px]">
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
              <div
                key={virtualRow.index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
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

                  <div>
                    <span className={`text-xs ${compact ? 'px-1.5 py-0.5' : 'px-2 py-1'} rounded-full ${
                      member.status === "active"
                        ? "bg-green-100 text-green-800"
                        : member.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-primary/10 text-primary"
                    }`}>
                      {getStatusText(member.status)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showShareButton && (
        <div className="mt-3 flex justify-end">
          <WhatsAppShare
            text={`Rejoins notre groupe "${title}" sur Naat !`}
          />
        </div>
      )}
    </div>
  );
}
