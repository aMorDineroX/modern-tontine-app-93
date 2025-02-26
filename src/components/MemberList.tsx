
import { User } from "lucide-react";

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
  return (
    <div className="tontine-card h-full animate-slide-up">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-xs px-2 py-1 bg-tontine-soft-blue rounded-full text-tontine-dark-purple">
          {members.length} members
        </span>
      </div>
      
      <div className="space-y-3">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3 overflow-hidden">
                {member.image ? (
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={16} className="text-gray-500" />
                )}
              </div>
              <span className="font-medium text-sm">{member.name}</span>
            </div>
            
            <div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                member.status === "active" 
                  ? "bg-green-100 text-green-800" 
                  : member.status === "pending" 
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-blue-100 text-blue-800"
              }`}>
                {member.status === "active" ? "Active" : member.status === "pending" ? "Pending" : "Paid"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
