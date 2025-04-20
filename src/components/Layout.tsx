import { ReactNode } from "react";
import Navbar from "./Navbar";
import FloatingChat from "./FloatingChat";
import { useChat } from "@/contexts/ChatContext";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isOpen, toggleChat, closeChat, unreadCount } = useChat();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      {children}
      <FloatingChat
        title="Support Naat"
        subtitle="Nous sommes là pour vous aider"
        isOpen={isOpen}
        unreadCount={unreadCount}
        onToggle={toggleChat}
        onClose={closeChat}
      />
    </div>
  );
}
