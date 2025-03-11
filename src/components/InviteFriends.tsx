
import { useState } from "react";
import { UserPlus, Mail, Copy, Check } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function InviteFriends() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const { t } = useApp();
  const { toast } = useToast();
  
  const inviteLink = `${window.location.origin}/signup?ref=${encodeURIComponent(localStorage.getItem("userEmail") || "")}`;
  
  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    
    // En conditions réelles, ceci serait géré par une fonction d'API
    if (email) {
      toast({
        title: t('invitationSent'),
        description: t('invitationSentDesc'),
      });
      setEmail("");
    }
  };
  
  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    
    toast({
      title: t('success'),
      description: t('linkCopied'),
    });
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 hover-scale">
          <UserPlus className="h-4 w-4" />
          <span>{t('inviteFriends')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('inviteFriendsTitle')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <form onSubmit={handleSendInvite} className="space-y-4">
            <div className="flex flex-col space-y-2">
              <label htmlFor="invite-email" className="text-sm font-medium">
                {t('inviteByEmail')}
              </label>
              <div className="flex space-x-2">
                <Input 
                  id="invite-email"
                  type="email" 
                  placeholder="ami@exemple.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="sm" disabled={!email}>
                  <Mail className="h-4 w-4 mr-2" />
                  {t('send')}
                </Button>
              </div>
            </div>
          </form>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('orShareLink')}</label>
            <div className="flex items-center space-x-2">
              <Input
                value={inviteLink}
                readOnly
                className="flex-1 text-xs"
              />
              <Button size="sm" onClick={copyInviteLink}>
                {copied ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copied ? t('copied') : t('copy')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
