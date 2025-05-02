import { ReactNode } from "react";
import Navbar from "./Navbar";
import FloatingChat from "./FloatingChat";
import PageTransition from "./PageTransition";
import { useChat } from "@/contexts/ChatContext";
import SkipToContent from "./accessibility/SkipToContent";
import AccessibilitySettings from "./accessibility/AccessibilitySettings";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isOpen, toggleChat, closeChat, unreadCount } = useChat();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SkipToContent contentId="main-content" />
      <Navbar />
      <main id="main-content" className="pb-20">
        <PageTransition>
          {children}
        </PageTransition>
      </main>

      {/* Floating accessibility settings button */}
      <div className="fixed bottom-24 right-4 z-40">
        <AccessibilitySettings className="shadow-md" />
      </div>

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
