import { QrCode } from "lucide-react";
import { Button } from "./ui/button";
import { useApp } from "@/contexts/AppContext";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface WhatsAppQRCodeProps {
  phoneNumber: string;
  message?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
  showIcon?: boolean;
  className?: string;
}

export default function WhatsAppQRCode({
  phoneNumber,
  message = "",
  size = "sm",
  variant = "outline",
  showIcon = true,
  className = ""
}: WhatsAppQRCodeProps) {
  const { t } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Format phone number to international format
  const formattedPhone = phoneNumber.replace(/\D/g, "");
  
  // Generate WhatsApp URL
  const whatsappUrl = `https://wa.me/${formattedPhone}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
  
  // Generate QR code URL using Google Charts API
  const qrCodeUrl = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(whatsappUrl)}&choe=UTF-8`;
  
  const handleShowQRCode = () => {
    setIsDialogOpen(true);
  };

  return (
    <>
      <Button
        variant={variant as any}
        size={size}
        className={`text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700 hover:border-green-700 ${className}`}
        onClick={handleShowQRCode}
      >
        {showIcon && <QrCode className="h-4 w-4 mr-2" />}
        {t('whatsAppQRCode')}
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('scanQRCodeToChat')}</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center p-4">
            <img
              src={qrCodeUrl}
              alt="WhatsApp QR Code"
              className="w-64 h-64 mb-4"
            />
            <p className="text-sm text-center text-gray-500">
              {t('scanWithWhatsApp')}
            </p>
            <div className="mt-4 flex items-center justify-center">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                alt="WhatsApp"
                className="h-6 w-6 mr-2"
              />
              <span className="font-medium">{phoneNumber}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
