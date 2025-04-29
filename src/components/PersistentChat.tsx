import { useState, useEffect } from "react";
import { MessageSquare, X, Send, Paperclip, Smile, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { useMediaQuery } from "@/hooks/use-media-query";

interface PersistentChatProps {
  className?: string;
}

export default function PersistentChat({ className = "" }: PersistentChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ text: string; sender: "user" | "system"; timestamp: Date }[]>([
    { text: "Bonjour ! Comment puis-je vous aider aujourd'hui ?", sender: "system", timestamp: new Date() }
  ]);
  const { t } = useApp();
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    // Add user message
    const userMessage = { text: message, sender: "user" as const, timestamp: new Date() };
    setMessages([...messages, userMessage]);
    setMessage("");
    
    // Simulate response after a short delay
    setTimeout(() => {
      const systemMessage = { 
        text: "Merci pour votre message. Un conseiller vous répondra bientôt.", 
        sender: "system" as const, 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, systemMessage]);
    }, 1000);
  };
  
  // Format timestamp to readable time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-80 sm:w-96 mb-2 flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 20, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Chat Header */}
            <div className="bg-primary p-3 text-white flex justify-between items-center">
              <h3 className="font-medium flex items-center">
                <MessageSquare size={18} className="mr-2" />
                {t('chat')}
              </h3>
              <button 
                onClick={toggleChat}
                className="text-white hover:text-gray-200 transition-colors"
                aria-label="Fermer le chat"
              >
                {isOpen ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
              </button>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 p-3 overflow-y-auto max-h-80 space-y-3">
              {messages.map((msg, index) => (
                <div 
                  key={index}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg p-2 ${
                      msg.sender === 'user' 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-xs opacity-70 text-right mt-1">
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="border-t border-gray-200 dark:border-gray-700 p-3 flex items-center">
              <button 
                type="button"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mr-2"
                aria-label="Joindre un fichier"
              >
                <Paperclip size={18} />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('typeMessage')}
                className="flex-1 border-none bg-transparent focus:outline-none focus:ring-0 text-gray-800 dark:text-gray-200 text-sm"
              />
              <button 
                type="button"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mx-2"
                aria-label="Insérer un emoji"
              >
                <Smile size={18} />
              </button>
              <button 
                type="submit"
                className="text-primary hover:text-primary/80 transition-colors"
                aria-label="Envoyer"
                disabled={!message.trim()}
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Chat Button */}
      <motion.button
        onClick={toggleChat}
        className={`bg-primary hover:bg-primary/90 text-white rounded-full p-3 shadow-lg flex items-center justify-center transition-colors ${isOpen ? 'w-12 h-12' : 'w-auto h-12'}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? "Fermer le chat" : "Ouvrir le chat"}
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <>
            <MessageSquare size={20} className="mr-2" />
            {!isMobile && <span className="font-medium">{t('chat')}</span>}
          </>
        )}
      </motion.button>
    </div>
  );
}
