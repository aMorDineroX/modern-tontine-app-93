import { MessageSquare } from "lucide-react";
import { Button } from "./ui/button";
import { useApp } from "@/contexts/AppContext";

interface WhatsAppChatProps {
  phoneNumber: string;
  message?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
  showIcon?: boolean;
  className?: string;
}

export default function WhatsAppChat({
  phoneNumber,
  message = "",
  size = "sm",
  variant = "outline",
  showIcon = true,
  className = ""
}: WhatsAppChatProps) {
  const { t } = useApp();
  
  // Format phone number to international format (remove spaces, +, etc.)
  const formattedPhone = phoneNumber.replace(/\D/g, "");
  
  const handleStartChat = () => {
    // WhatsApp API URL
    const whatsappUrl = `https://wa.me/${formattedPhone}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <Button
      variant={variant as any}
      size={size}
      className={`text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700 hover:border-green-700 ${className}`}
      onClick={handleStartChat}
    >
      {showIcon && (
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
          alt="WhatsApp"
          className="h-4 w-4 mr-2"
        />
      )}
      {t('chatOnWhatsApp')}
    </Button>
  );
}
