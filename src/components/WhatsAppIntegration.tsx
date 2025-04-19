import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import WhatsAppChat from "./WhatsAppChat";
import WhatsAppGroup from "./WhatsAppGroup";
import WhatsAppNotification from "./WhatsAppNotification";
import WhatsAppQRCode from "./WhatsAppQRCode";
import WhatsAppShare from "./WhatsAppShare";
import { useApp } from "@/contexts/AppContext";

interface WhatsAppIntegrationProps {
  groupName?: string;
  groupDescription?: string;
  phoneNumber?: string;
  groupId?: string;
  className?: string;
}

export default function WhatsAppIntegration({
  groupName = "Naat Group",
  groupDescription = "",
  phoneNumber = "",
  groupId = "",
  className = ""
}: WhatsAppIntegrationProps) {
  const { t } = useApp();
  const [activeTab, setActiveTab] = useState("share");
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
            alt="WhatsApp"
            className="h-6 w-6 mr-2"
          />
          {t('whatsAppIntegration')}
        </CardTitle>
        <CardDescription>
          {t('whatsAppIntegrationDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="share">{t('share')}</TabsTrigger>
            <TabsTrigger value="chat">{t('chat')}</TabsTrigger>
            <TabsTrigger value="group">{t('group')}</TabsTrigger>
            <TabsTrigger value="qrcode">{t('qrCode')}</TabsTrigger>
            <TabsTrigger value="notifications">{t('notifications')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="share" className="space-y-4">
            <p className="text-sm text-gray-500">
              {t('shareGroupDescription')}
            </p>
            <div className="flex justify-center mt-4">
              <WhatsAppShare
                text={`${t('checkOut')} ${groupName} ${t('onNaat')}!`}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="chat" className="space-y-4">
            <p className="text-sm text-gray-500">
              {t('startChatDescription')}
            </p>
            <div className="flex flex-col space-y-4 mt-4">
              <div className="flex items-center space-x-2">
                <input
                  type="tel"
                  placeholder="+33612345678"
                  className="flex-1 p-2 border rounded-md"
                  value={phoneNumber}
                  readOnly={!!phoneNumber}
                />
                <WhatsAppChat
                  phoneNumber={phoneNumber || "+33612345678"}
                  message={`${t('hello')} ${t('fromNaat')}!`}
                  showIcon={true}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="group" className="space-y-4">
            <p className="text-sm text-gray-500">
              {t('createGroupDescription')}
            </p>
            <div className="flex justify-center mt-4">
              <WhatsAppGroup
                groupName={groupName}
                description={groupDescription}
                showIcon={true}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="qrcode" className="space-y-4">
            <p className="text-sm text-gray-500">
              {t('qrCodeDescription')}
            </p>
            <div className="flex justify-center mt-4">
              <WhatsAppQRCode
                phoneNumber={phoneNumber || "+33612345678"}
                message={`${t('hello')} ${t('fromNaat')}!`}
                showIcon={true}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
            <p className="text-sm text-gray-500">
              {t('notificationsDescription')}
            </p>
            <div className="mt-4">
              <WhatsAppNotification
                phoneNumber={phoneNumber || "+33612345678"}
                groupId={groupId}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
