import { Bell } from "lucide-react";
import { Button } from "./ui/button";
import { useApp } from "@/contexts/AppContext";
import { Switch } from "./ui/switch";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface WhatsAppNotificationProps {
  phoneNumber: string;
  groupId?: string;
  className?: string;
}

export default function WhatsAppNotification({
  phoneNumber,
  groupId,
  className = ""
}: WhatsAppNotificationProps) {
  const { t } = useApp();
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  const handleToggleNotifications = () => {
    // In a real app, this would update a database setting
    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    
    if (newState) {
      // Format phone number to international format
      const formattedPhone = phoneNumber.replace(/\D/g, "");
      
      // Create opt-in message for WhatsApp notifications
      const message = `${t('enableWhatsAppNotifications')} ${groupId ? `${t('forGroup')}: ${groupId}` : ''}`;
      
      // Open WhatsApp with the opt-in message
      const whatsappUrl = `https://wa.me/+33123456789?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
      
      toast({
        title: t('success'),
        description: t('whatsAppNotificationsEnabled')
      });
    } else {
      toast({
        title: t('success'),
        description: t('whatsAppNotificationsDisabled')
      });
    }
  };

  return (
    <div className={`flex items-center justify-between p-4 border rounded-lg ${className}`}>
      <div className="flex items-center space-x-3">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
          alt="WhatsApp"
          className="h-5 w-5"
        />
        <div>
          <h4 className="font-medium">{t('whatsAppNotifications')}</h4>
          <p className="text-sm text-gray-500">
            {notificationsEnabled ? t('notificationsEnabled') : t('notificationsDisabled')}
          </p>
        </div>
      </div>
      
      <Switch
        checked={notificationsEnabled}
        onCheckedChange={handleToggleNotifications}
      />
    </div>
  );
}
