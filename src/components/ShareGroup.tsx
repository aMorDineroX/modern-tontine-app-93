import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, QrCode, Copy, Check, Link, Mail, Download } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Group } from '@/types/group';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface ShareGroupProps {
  group: Group | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareGroup({ group, isOpen, onClose }: ShareGroupProps) {
  const [activeTab, setActiveTab] = useState('qrcode');
  const [copied, setCopied] = useState(false);
  const { t } = useApp();
  const { toast } = useToast();
  
  if (!group) return null;
  
  // Générer l'URL de partage
  const shareUrl = `https://naat.app/group/${group.id}`;
  
  // Générer le QR code (simulé)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
  
  // Fonction pour copier l'URL
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: t('linkCopied'),
        description: t('linkCopiedSuccess'),
      });
    });
  };
  
  // Fonction pour partager par e-mail
  const shareByEmail = () => {
    const subject = encodeURIComponent(`${t('joinGroup')}: ${group.name}`);
    const body = encodeURIComponent(`${t('inviteText')}\n\n${shareUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };
  
  // Fonction pour télécharger le QR code
  const downloadQrCode = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `naat-group-${group.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: t('qrCodeDownloaded'),
      description: t('qrCodeDownloadedSuccess'),
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Share2 size={18} className="mr-2 text-primary" />
            {t('shareGroup')}: {group.name}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="qrcode" onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="qrcode" className="flex items-center">
              <QrCode size={16} className="mr-2" />
              {t('qrCode')}
            </TabsTrigger>
            <TabsTrigger value="link" className="flex items-center">
              <Link size={16} className="mr-2" />
              {t('link')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="qrcode" className="space-y-4">
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <img 
                  src={qrCodeUrl} 
                  alt={`QR Code for ${group.name}`} 
                  className="w-48 h-48"
                />
              </div>
            </div>
            
            <p className="text-sm text-center text-gray-500 dark:text-gray-400">
              {t('scanQrCodeText')}
            </p>
            
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                className="flex items-center" 
                onClick={downloadQrCode}
              >
                <Download size={16} className="mr-2" />
                {t('downloadQrCode')}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="link" className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 rounded-md text-sm truncate">
                {shareUrl}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-shrink-0" 
                onClick={copyToClipboard}
              >
                {copied ? (
                  <Check size={16} className="text-green-500" />
                ) : (
                  <Copy size={16} />
                )}
              </Button>
            </div>
            
            <div className="flex justify-center space-x-2">
              <Button 
                variant="outline" 
                className="flex items-center" 
                onClick={copyToClipboard}
              >
                <Copy size={16} className="mr-2" />
                {t('copyLink')}
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center" 
                onClick={shareByEmail}
              >
                <Mail size={16} className="mr-2" />
                {t('shareByEmail')}
              </Button>
            </div>
            
            <p className="text-sm text-center text-gray-500 dark:text-gray-400">
              {t('shareLinkText')}
            </p>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('shareDisclaimer')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
