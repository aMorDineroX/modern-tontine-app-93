
import { DollarSign, PiggyBank } from "lucide-react";

type ContributionCardProps = {
  title: string;
  amount: string;
  trend?: string;
  icon: "contribution" | "balance";
};

export default function ContributionCard({ title, amount, trend, icon }: ContributionCardProps) {
  return (
    <div className="tontine-card animate-slide-up">
      <div className="flex items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 bg-secondary`}>
          {icon === "contribution" ? (
            <DollarSign size={20} className="text-primary" />
          ) : (
            <PiggyBank size={20} className="text-primary" />
          )}
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <p className="text-2xl font-semibold text-foreground">{amount}</p>
          {trend && (
            <p className="text-xs text-green-600">{trend}</p>
          )}
        </div>
      </div>
    </div>
  );
}
