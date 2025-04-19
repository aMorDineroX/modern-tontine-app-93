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
};

export default function MemberList({ members, title }: MemberListProps) {
  const { t } = useApp();

  const getStatusText = (status: "active" | "pending" | "paid") => {
    switch(status) {
      case "active": return t('active');
      case "pending": return t('pending');
      case "paid": return t('paid');
      default: return '';
    }
  };

  return (
    <div className="tontine-card h-full animate-slide-up">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <span className="text-xs px-2 py-1 bg-secondary rounded-full text-primary">
          {members.length} {t('members')}
        </span>
      </div>

      <div className="space-y-3">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-2 hover:bg-secondary/50 rounded-lg transition-colors">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center mr-3 overflow-hidden">
                {member.image ? (
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={16} className="text-muted-foreground" />
                )}
              </div>
              <span className="font-medium text-sm text-foreground">{member.name}</span>
            </div>

            <div>
              <span className={`text-xs px-2 py-1 rounded-full ${
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
      </div>

      <div className="mt-4 flex justify-end">
        <WhatsAppShare
          text={`Rejoins notre groupe "${title}" sur Tontine !`}
        />
      </div>
    </div>
  );
}
