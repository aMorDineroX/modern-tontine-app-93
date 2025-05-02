import React from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';

/**
 * Announcer component for screen reader announcements
 * This component renders invisible elements that announce messages to screen readers
 * 
 * @component
 * @example
 * // In a component:
 * const { announce } = useAccessibility();
 * announce('Item added to cart');
 * 
 * // In the app:
 * <Announcer />
 */
const Announcer: React.FC = () => {
  const { announcements } = useAccessibility();
  
  return (
    <>
      {/* Polite announcements */}
      <div 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
        data-testid="polite-announcer"
      >
        {announcements.map((announcement, index) => (
          <div key={`announcement-polite-${index}`}>{announcement}</div>
        ))}
      </div>
      
      {/* Assertive announcements */}
      <div 
        className="sr-only" 
        aria-live="assertive" 
        aria-atomic="true"
        data-testid="assertive-announcer"
      >
        {announcements.map((announcement, index) => (
          <div key={`announcement-assertive-${index}`}>{announcement}</div>
        ))}
      </div>
    </>
  );
};

export default Announcer;
