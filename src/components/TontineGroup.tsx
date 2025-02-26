
import { CalendarIcon, Coins, Users } from "lucide-react";

type TontineGroupProps = {
  name: string;
  members: number;
  contribution: string;
  nextDue: string;
  onClick?: () => void;
};

export default function TontineGroup({ name, members, contribution, nextDue, onClick }: TontineGroupProps) {
  return (
    <div 
      className="tontine-card cursor-pointer animate-fade-in"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold">{name}</h3>
        <div className="flex items-center space-x-1">
          <Users size={16} className="text-tontine-dark-purple" />
          <span className="text-sm text-gray-600">{members}</span>
        </div>
      </div>
      
      <div className="flex flex-col space-y-3">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-tontine-soft-blue flex items-center justify-center mr-3">
            <Coins size={16} className="text-tontine-dark-purple" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Contribution</p>
            <p className="font-medium">{contribution}</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-tontine-soft-green flex items-center justify-center mr-3">
            <CalendarIcon size={16} className="text-tontine-dark-purple" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Next Due</p>
            <p className="font-medium">{nextDue}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
