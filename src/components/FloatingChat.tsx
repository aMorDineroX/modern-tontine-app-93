import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, X, Send, Paperclip, Smile } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ChatMessage, createMessage, generateAutomaticResponse } from "@/services/chatService";

// Interface pour les props du composant

interface FloatingChatProps {
  initialMessages?: ChatMessage[];
  onSendMessage?: (message: string) => void;
  onClose?: () => void;
  onToggle?: () => void;
  title?: string;
  subtitle?: string;
  isOpen?: boolean;
  unreadCount?: number;
}

export default function FloatingChat({
  initialMessages = [],
  onSendMessage,
  onClose,
  onToggle,
  title = "Chat",
  subtitle = "Support en ligne",
  isOpen: externalIsOpen,
  unreadCount: externalUnreadCount = 0
}: FloatingChatProps) {
  // Utiliser les états externes s'ils sont fournis, sinon utiliser des états locaux
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [internalUnreadCount, setInternalUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  // Pas besoin de formatAmount pour l'instant

  // Fonction simple pour formater la date
  const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions) => {
    return new Date(date).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      ...options
    });
  };

  // Déterminer si nous utilisons l'état externe ou interne
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const unreadCount = externalUnreadCount !== undefined ? externalUnreadCount : internalUnreadCount;

  // Simuler la réception d'un message de bienvenue
  useEffect(() => {
    if (messages.length === 0 && isOpen) {
      const welcomeMessage: ChatMessage = {
        id: `welcome-${Date.now()}`,
        sender: {
          id: "system",
          name: "Assistant Naat",
          avatar: "/logo.svg"
        },
        content: "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
        timestamp: new Date(),
        isRead: false
      };

      setMessages([welcomeMessage]);
      if (externalUnreadCount === undefined) {
        setInternalUnreadCount(prev => prev + 1);
      }
    }
  }, [isOpen, messages.length, externalUnreadCount]);

  // Faire défiler vers le bas lorsque de nouveaux messages arrivent
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      if (externalUnreadCount === undefined) {
        setInternalUnreadCount(0);
      }
    }
  }, [messages, isOpen, externalUnreadCount]);

  // Générer une réponse automatique après un certain délai
  const simulateResponse = (userMessage: string) => {
    setTimeout(() => {
      // Utiliser le service pour générer une réponse basée sur le message de l'utilisateur
      const responseContent = generateAutomaticResponse(userMessage);

      const responseMessage = createMessage(
        "system",
        "Assistant Naat",
        responseContent,
        "/logo.svg"
      );

      setMessages(prev => [...prev, responseMessage]);

      if (!isOpen && externalUnreadCount === undefined) {
        setInternalUnreadCount(prev => prev + 1);
      }
    }, 1000);
  };

  const handleSendMessage = (e?: React.MouseEvent | React.KeyboardEvent | React.FormEvent) => {
    // Empêcher le comportement par défaut pour éviter la redirection
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (newMessage.trim() === "") return;

    const userMessage = createMessage(
      user?.id || "user",
      user?.user_metadata?.full_name || "Vous",
      newMessage,
      user?.user_metadata?.avatar_url
    );

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");

    if (onSendMessage) {
      onSendMessage(newMessage);
    }

    // Simuler une réponse automatique
    simulateResponse(newMessage);

    // Focus sur l'input après l'envoi
    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Retourner false pour empêcher la soumission du formulaire
    return false;
  };



  const toggleChat = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }

    if (isOpen && externalUnreadCount === undefined) {
      setInternalUnreadCount(0);
    }
  };





  return (
    <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-50 flex flex-col items-end">
      <Dialog open={isOpen} onOpenChange={(open) => {
        // Empêcher la fermeture du dialog de rediriger vers la page d'accueil
        if (open !== isOpen) {
          toggleChat();
        }
      }}>
        <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-md md:max-w-lg h-[90vh] sm:h-auto max-h-[90vh] p-3 sm:p-6 overflow-hidden">
          <DialogHeader className="border-b pb-2 flex flex-row items-center justify-between px-1 sm:px-0">
            <div className="flex items-center">
              <Avatar className="h-6 w-6 sm:h-8 sm:w-8 mr-2">
                <AvatarImage src="/logo.svg" alt="Naat" />
                <AvatarFallback>NA</AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-base sm:text-lg font-medium">{title}</DialogTitle>
                <p className="text-xs text-muted-foreground hidden sm:block">{subtitle}</p>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(e);
            return false;
          }}>
            <div className="h-[calc(90vh-10rem)] sm:h-[400px] overflow-hidden py-2 sm:py-4">
              <ScrollArea className="h-full pr-2">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender.id === (user?.id || "user") ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex ${message.sender.id === (user?.id || "user") ? 'flex-row-reverse' : 'flex-row'} items-start gap-2 max-w-[80%]`}>
                        {message.sender.id !== (user?.id || "user") && (
                          <Avatar className="h-6 w-6 sm:h-8 sm:w-8 mt-1">
                            <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                            <AvatarFallback>{message.sender.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <div
                            className={`rounded-lg p-2 sm:p-3 text-xs sm:text-sm ${
                              message.sender.id === (user?.id || "user")
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            {message.content}
                          </div>
                          <p className={`text-[10px] sm:text-xs mt-1 ${
                            message.sender.id === (user?.id || "user") ? 'text-right' : ''
                          } text-muted-foreground`}>
                            {formatDate(message.timestamp, { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            <DialogFooter className="flex items-center border-t pt-2 sm:pt-4 px-0">
              <div className="flex items-center w-full gap-2">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 hidden sm:flex">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(e)}
                  placeholder="Écrivez votre message..."
                  className="h-9 sm:h-10 text-sm flex-1 px-2 sm:px-3"
                />
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 hidden sm:flex">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  disabled={newMessage.trim() === ""}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Button
        onClick={toggleChat}
        variant={isOpen ? "outline" : "default"}
        size="icon"
        className="h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-lg relative"
      >
        {isOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />}
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 text-[10px] sm:text-xs">
            {unreadCount}
          </Badge>
        )}
      </Button>
    </div>
  );
}
