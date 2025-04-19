import { User } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import WhatsAppShare from "./WhatsAppShare";

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

  const getStatusText = (status: "active" | "pending" | "paid") => {
    switch(status) {
      case "active": return t('active');
      case "pending": return t('pending');
      case "paid": return t('paid');
      default: return '';
    }
  };

  // Determine which members to display based on maxDisplay
  const displayMembers = maxDisplay ? members.slice(0, maxDisplay) : members;
  const hasMoreMembers = maxDisplay && members.length > maxDisplay;

  return (
    <div className={`tontine-card animate-slide-up ${compact ? 'p-3' : ''}`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <span className="text-xs px-2 py-0.5 bg-secondary rounded-full text-primary">
          {members.length} {t('members')}
        </span>
      </div>

      <div className={`${compact ? 'space-y-2' : 'space-y-3'}`}>
        {displayMembers.map((member) => (
          <div key={member.id} className={`flex items-center justify-between ${compact ? 'p-1.5' : 'p-2'} hover:bg-secondary/50 rounded-lg transition-colors`}>
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
        ))}

        {hasMoreMembers && (
          <div className="text-center text-sm text-muted-foreground py-1 hover:text-primary cursor-pointer">
            + {members.length - maxDisplay} {t('more')}
          </div>
        )}
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
