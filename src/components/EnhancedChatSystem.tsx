import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Paperclip, Smile, Image, Mic, MoreVertical, User, Check, CheckCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/utils/supabase";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  sender_id: string;
  receiver_id?: string;
  group_id?: string;
  content: string;
  attachment_url?: string;
  created_at: string;
  read: boolean;
  sender?: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

interface EnhancedChatSystemProps {
  receiverId?: string;
  groupId?: string;
  isGroupChat?: boolean;
  title?: string;
  onClose?: () => void;
}

export default function EnhancedChatSystem({ 
  receiverId, 
  groupId, 
  isGroupChat = false,
  title,
  onClose
}: EnhancedChatSystemProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Fetch messages on component mount
  useEffect(() => {
    if (!user) return;
    
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        let query;
        
        if (isGroupChat && groupId) {
          // Fetch group messages
          query = supabase
            .from('group_messages')
            .select('*, sender:user_id(*)')
            .eq('group_id', groupId)
            .order('created_at', { ascending: true });
        } else if (receiverId) {
          // Fetch direct messages
          query = supabase
            .from('messages')
            .select('*, sender:sender_id(*)')
            .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
            .order('created_at', { ascending: true });
        } else {
          throw new Error("Either receiverId or groupId must be provided");
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        setMessages(data || []);
        
        // Mark messages as read
        if (data && data.length > 0) {
          const unreadMessages = data.filter(m => 
            m.sender_id !== user.id && !m.read
          );
          
          if (unreadMessages.length > 0) {
            markMessagesAsRead(unreadMessages.map(m => m.id));
          }
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les messages",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMessages();
    
    // Subscribe to new messages
    let subscription;
    
    if (isGroupChat && groupId) {
      subscription = supabase
        .channel(`group-messages-${groupId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${groupId}`
        }, (payload) => {
          const newMessage = payload.new as Message;
          
          // Fetch sender details
          supabase
            .from('users')
            .select('id, email, full_name, avatar_url')
            .eq('id', newMessage.sender_id)
            .single()
            .then(({ data }) => {
              if (data) {
                newMessage.sender = data;
              }
              
              setMessages(prev => [...prev, newMessage]);
              
              // Mark as read if not from current user
              if (newMessage.sender_id !== user.id) {
                markMessagesAsRead([newMessage.id]);
              }
            });
        })
        .subscribe();
    } else if (receiverId) {
      subscription = supabase
        .channel(`direct-messages-${user.id}-${receiverId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id}))`
        }, (payload) => {
          const newMessage = payload.new as Message;
          
          // Fetch sender details
          supabase
            .from('users')
            .select('id, email, full_name, avatar_url')
            .eq('id', newMessage.sender_id)
            .single()
            .then(({ data }) => {
              if (data) {
                newMessage.sender = data;
              }
              
              setMessages(prev => [...prev, newMessage]);
              
              // Mark as read if not from current user
              if (newMessage.sender_id !== user.id) {
                markMessagesAsRead([newMessage.id]);
              }
            });
        })
        .subscribe();
    }
    
    // Subscribe to typing indicators
    const typingChannel = supabase.channel(`typing-${isGroupChat ? groupId : `${user.id}-${receiverId}`}`);
    
    typingChannel
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.user_id !== user.id) {
          setIsTyping(true);
          
          // Clear previous timeout
          if (typingTimeout) {
            clearTimeout(typingTimeout);
          }
          
          // Set new timeout to clear typing indicator
          const timeout = setTimeout(() => {
            setIsTyping(false);
          }, 3000);
          
          setTypingTimeout(timeout);
        }
      })
      .subscribe();
    
    return () => {
      // Unsubscribe from all channels
      if (subscription) {
        subscription.unsubscribe();
      }
      
      typingChannel.unsubscribe();
      
      // Clear typing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [user, receiverId, groupId, isGroupChat, toast]);
  
  const markMessagesAsRead = async (messageIds: string[]) => {
    if (!messageIds.length) return;
    
    try {
      const table = isGroupChat ? 'group_messages' : 'messages';
      
      await supabase
        .from(table)
        .update({ read: true })
        .in('id', messageIds);
      
      // Update local state
      setMessages(prev => 
        prev.map(message => 
          messageIds.includes(message.id) 
            ? { ...message, read: true } 
            : message
        )
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };
  
  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !attachment) || !user) return;
    
    setIsSending(true);
    
    try {
      let attachmentUrl = '';
      
      // Upload attachment if exists
      if (attachment) {
        const fileName = `${user.id}/${Date.now()}-${attachment.name}`;
        
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('chat-attachments')
          .upload(fileName, attachment);
        
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: urlData } = supabase
          .storage
          .from('chat-attachments')
          .getPublicUrl(fileName);
        
        attachmentUrl = urlData.publicUrl;
      }
      
      // Prepare message data
      const messageData: any = {
        content: newMessage.trim(),
        sender_id: user.id,
        created_at: new Date().toISOString(),
        read: false
      };
      
      if (attachmentUrl) {
        messageData.attachment_url = attachmentUrl;
      }
      
      // Add receiver or group ID
      if (isGroupChat && groupId) {
        messageData.group_id = groupId;
      } else if (receiverId) {
        messageData.receiver_id = receiverId;
      } else {
        throw new Error("Either receiverId or groupId must be provided");
      }
      
      // Insert message
      const table = isGroupChat ? 'group_messages' : 'messages';
      const { data, error } = await supabase
        .from(table)
        .insert(messageData)
        .select()
        .single();
      
      if (error) throw error;
      
      // Clear input and attachment
      setNewMessage("");
      setAttachment(null);
      
      // Add sender info to the message
      data.sender = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name,
        avatar_url: user.user_metadata?.avatar_url
      };
      
      // Add to messages (optimistic update)
      setMessages(prev => [...prev, data]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Broadcast typing indicator
    supabase.channel(`typing-${isGroupChat ? groupId : `${user?.id}-${receiverId}`}`)
      .send({
        type: 'broadcast',
        event: 'typing',
        payload: { user_id: user?.id }
      });
  };
  
  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };
  
  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hier";
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Group messages by date
  const groupedMessages: { [key: string]: Message[] } = {};
  messages.forEach(message => {
    const date = new Date(message.created_at).toDateString();
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(message);
  });
  
  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="py-3 px-4 border-b">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src={isGroupChat ? undefined : undefined /* receiver?.avatar_url */} />
              <AvatarFallback>
                {isGroupChat ? (
                  <User className="h-4 w-4" />
                ) : (
                  (receiverId?.substring(0, 2) || "").toUpperCase()
                )}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-base">
              {title || (isGroupChat ? `Groupe ${groupId}` : `Chat avec ${receiverId}`)}
            </CardTitle>
          </div>
          <div className="flex items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Mic className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Appel audio</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Options</DropdownMenuLabel>
                <DropdownMenuItem>Voir le profil</DropdownMenuItem>
                <DropdownMenuItem>Rechercher</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Bloquer</DropdownMenuItem>
                <DropdownMenuItem className="text-red-500">Supprimer la conversation</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {onClose && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow p-0 overflow-hidden">
        <ScrollArea className="h-full p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-full text-gray-500">
              <p>Aucun message</p>
              <p className="text-sm mt-2">Commencez la conversation en envoyant un message</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                <div key={date} className="space-y-3">
                  <div className="flex justify-center">
                    <div className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs px-2 py-1 rounded-full">
                      {formatDate(dateMessages[0].created_at)}
                    </div>
                  </div>
                  
                  {dateMessages.map((message, index) => {
                    const isCurrentUser = message.sender_id === user?.id;
                    const showAvatar = !isCurrentUser && (index === 0 || dateMessages[index - 1].sender_id !== message.sender_id);
                    
                    return (
                      <div 
                        key={message.id} 
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isCurrentUser && showAvatar && (
                          <Avatar className="h-8 w-8 mr-2 mt-1">
                            <AvatarImage src={message.sender?.avatar_url} />
                            <AvatarFallback>
                              {(message.sender?.full_name?.substring(0, 2) || message.sender?.email?.substring(0, 2) || "").toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className={`max-w-[70%] ${!isCurrentUser && !showAvatar ? 'ml-10' : ''}`}>
                          {!isCurrentUser && showAvatar && (
                            <div className="text-xs text-gray-500 mb-1 ml-1">
                              {message.sender?.full_name || message.sender?.email?.split('@')[0]}
                            </div>
                          )}
                          
                          <div className="flex flex-col">
                            {message.attachment_url && (
                              <a 
                                href={message.attachment_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={`mb-1 rounded-lg overflow-hidden border ${isCurrentUser ? 'border-primary/20' : 'border-gray-200 dark:border-gray-700'}`}
                              >
                                {message.attachment_url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                                  <img 
                                    src={message.attachment_url} 
                                    alt="Attachment" 
                                    className="max-w-full max-h-[200px] object-contain"
                                  />
                                ) : (
                                  <div className="bg-gray-100 dark:bg-gray-800 p-3 flex items-center">
                                    <Paperclip className="h-4 w-4 mr-2 text-gray-500" />
                                    <span className="text-sm truncate">
                                      {message.attachment_url.split('/').pop()}
                                    </span>
                                  </div>
                                )}
                              </a>
                            )}
                            
                            {message.content && (
                              <div 
                                className={`px-3 py-2 rounded-lg ${
                                  isCurrentUser 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                                }`}
                              >
                                {message.content}
                              </div>
                            )}
                            
                            <div className={`flex items-center mt-1 text-xs text-gray-500 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                              <span>{formatTime(message.created_at)}</span>
                              {isCurrentUser && (
                                <span className="ml-1">
                                  {message.read ? (
                                    <CheckCheck className="h-3 w-3 text-primary" />
                                  ) : (
                                    <Check className="h-3 w-3" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </CardContent>
      
      {attachment && (
        <div className="px-4 py-2 border-t flex items-center">
          <div className="flex-1 bg-gray-100 dark:bg-gray-800 p-2 rounded-md flex items-center">
            <Paperclip className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-sm truncate flex-1">{attachment.name}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={removeAttachment}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      <CardFooter className="p-4 border-t">
        <div className="flex items-center w-full">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 mr-1"
            onClick={handleAttachmentClick}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 mr-2"
          >
            <Image className="h-4 w-4" />
          </Button>
          
          <Input
            placeholder="Écrivez un message..."
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            className="flex-1"
            disabled={isSending}
          />
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 ml-2"
          >
            <Smile className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="primary" 
            size="icon" 
            className="h-8 w-8 ml-1"
            onClick={handleSendMessage}
            disabled={(!newMessage.trim() && !attachment) || isSending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
