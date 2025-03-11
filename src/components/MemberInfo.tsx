
import { useState } from "react";
import { User, Mail, Phone, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/AppContext";

type MemberInfoProps = {
  id: string | number;
  name: string;
  email?: string;
  phone?: string;
  image?: string;
  status?: "active" | "pending" | "paid";
  contribution?: string | number;
  onMessage?: (id: string | number) => void;
};

export default function MemberInfo({ 
  id, 
  name, 
  email, 
  phone, 
  image, 
  status, 
  contribution,
  onMessage 
}: MemberInfoProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();
  const { t, formatAmount } = useApp();
  
  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t('success'),
      description: `${type} ${t('copied').toLowerCase()}`,
    });
  };
  
  const formattedContribution = typeof contribution === "number" || typeof contribution === "string" 
    ? formatAmount(contribution) 
    : undefined;
  
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow animate-fade-in">
      <div className="p-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-600">
            {image ? (
              <img src={image} alt={name} className="w-full h-full object-cover" />
            ) : (
              <User className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold">{name}</h3>
            {status && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                status === "active" 
                  ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400" 
                  : status === "pending" 
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400"
              }`}>
                {t(status)}
              </span>
            )}
            {formattedContribution && (
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t('contribution')}: <span className="font-medium">{formattedContribution}</span>
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? t('less') : t('more')}
          </Button>
        </div>
        
        {showDetails && (
          <div className="mt-4 space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800 animate-fade-in">
            {email && (
              <div className="flex justify-between items-center">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="h-4 w-4 mr-2" />
                  {email}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleCopy(email, 'Email')}
                >
                  {t('copy')}
                </Button>
              </div>
            )}
            
            {phone && (
              <div className="flex justify-between items-center">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="h-4 w-4 mr-2" />
                  {phone}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleCopy(phone, 'Téléphone')}
                >
                  {t('copy')}
                </Button>
              </div>
            )}
            
            {onMessage && (
              <Button 
                variant="outline" 
                className="w-full mt-2 gap-2"
                onClick={() => onMessage(id)}
              >
                <MessageSquare className="h-4 w-4" />
                {t('sendMessage')}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
