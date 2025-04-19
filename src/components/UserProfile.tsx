
import { User } from "lucide-react";

type UserProfileProps = {
  name: string;
  contribution: string;
  image?: string;
};

export default function UserProfile({ name, contribution, image }: UserProfileProps) {
  return (
    <div className="flex flex-col items-center p-6 animate-fade-in">
      <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-4 overflow-hidden border-2 border-primary">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <User size={40} className="text-primary" />
        )}
      </div>
      <h2 className="text-xl font-semibold text-foreground">{name}</h2>
      <div className="mt-1 px-3 py-1 bg-primary/10 rounded-full text-sm font-medium text-primary">
        {contribution}
      </div>
    </div>
  );
}
