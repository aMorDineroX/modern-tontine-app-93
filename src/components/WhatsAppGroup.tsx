import { Users } from "lucide-react";
import { Button } from "./ui/button";
import { useApp } from "@/contexts/AppContext";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";

interface WhatsAppGroupProps {
  groupName: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
  showIcon?: boolean;
  className?: string;
}

export default function WhatsAppGroup({
  groupName,
  description = "",
  size = "sm",
  variant = "outline",
  showIcon = true,
  className = ""
}: WhatsAppGroupProps) {
  const { t } = useApp();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  
  const handleCreateGroup = () => {
    setIsDialogOpen(true);
  };
  
  const handleAddPhoneNumber = () => {
    if (newPhoneNumber.trim()) {
      setPhoneNumbers([...phoneNumbers, newPhoneNumber.trim()]);
      setNewPhoneNumber("");
    }
  };
  
  const handleRemovePhoneNumber = (index: number) => {
    const updatedNumbers = [...phoneNumbers];
    updatedNumbers.splice(index, 1);
    setPhoneNumbers(updatedNumbers);
  };
  
  const handleGenerateWhatsAppGroup = () => {
    if (phoneNumbers.length === 0) {
      toast({
        title: t('error'),
        description: t('addAtLeastOneMember'),
        variant: "destructive"
      });
      return;
    }
    
    // Format message with group info
    const message = `${t('inviteToJoinGroup')} "${groupName}"${description ? `: ${description}` : ''}`;
    
    // WhatsApp doesn't have a direct API to create groups, so we'll open a chat with the first person
    // and provide instructions to create a group with the others
    const firstNumber = phoneNumbers[0].replace(/\D/g, "");
    const otherNumbers = phoneNumbers.slice(1).map(num => num.replace(/\D/g, "")).join(", ");
    
    const whatsappMessage = `${message}\n\n${otherNumbers ? `${t('pleaseCreateGroupWith')}: ${otherNumbers}` : ''}`;
    const whatsappUrl = `https://wa.me/${firstNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    
    window.open(whatsappUrl, "_blank");
    setIsDialogOpen(false);
    
    toast({
      title: t('success'),
      description: t('whatsAppGroupInitiated')
    });
  };

  return (
    <>
      <Button
        variant={variant as any}
        size={size}
        className={`text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700 hover:border-green-700 ${className}`}
        onClick={handleCreateGroup}
      >
        {showIcon && (
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
            alt="WhatsApp"
            className="h-4 w-4 mr-2"
          />
        )}
        {t('createWhatsAppGroup')}
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('createWhatsAppGroup')}: {groupName}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('addMembers')}</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="+33612345678"
                  value={newPhoneNumber}
                  onChange={(e) => setNewPhoneNumber(e.target.value)}
                />
                <Button onClick={handleAddPhoneNumber}>{t('add')}</Button>
              </div>
            </div>
            
            {phoneNumbers.length > 0 && (
              <div className="space-y-2">
                <Label>{t('members')}</Label>
                <div className="border rounded-md p-2 space-y-2">
                  {phoneNumbers.map((number, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{number}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePhoneNumber(index)}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={handleGenerateWhatsAppGroup}
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                alt="WhatsApp"
                className="h-4 w-4 mr-2"
              />
              {t('createGroup')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
