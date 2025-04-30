import React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
  mobileView: React.ReactNode;
  desktopView: React.ReactNode;
}

export default function MobileOptimizedLayout({ 
  children, 
  mobileView, 
  desktopView 
}: MobileOptimizedLayoutProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  return (
    <div className="w-full">
      {isMobile ? mobileView : desktopView}
      {children}
    </div>
  );
}
