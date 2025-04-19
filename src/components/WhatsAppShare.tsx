
import { Share } from "lucide-react";
import { Button } from "./ui/button";

interface WhatsAppShareProps {
  text: string;
  url?: string;
}

export default function WhatsAppShare({ text, url }: WhatsAppShareProps) {
  const handleShare = () => {
    const shareUrl = url || window.location.href;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + "\n" + shareUrl)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700 hover:border-green-700 font-medium"
      onClick={handleShare}
    >
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
        alt="WhatsApp"
        className="h-4 w-4 mr-2"
      />
      Partager sur WhatsApp
    </Button>
  );
}
