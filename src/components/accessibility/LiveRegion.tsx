import React, { useEffect, useRef, useState } from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';

interface LiveRegionProps {
  /** The content to be announced by screen readers */
  children: React.ReactNode;
  /** The politeness level of the announcement */
  politeness?: 'polite' | 'assertive';
  /** Whether to clear the region after announcement */
  clearAfter?: number;
  /** Additional CSS classes */
  className?: string;
  /** Whether to visually hide the region */
  visuallyHidden?: boolean;
  /** The role of the region */
  role?: 'status' | 'alert' | 'log' | 'marquee' | 'timer' | 'progressbar';
  /** Whether the content is atomic (should be announced as a whole) */
  atomic?: boolean;
  /** Whether the region should be relevant to all users */
  relevant?: 'additions' | 'removals' | 'text' | 'all';
  /** Whether to also announce the content using the global announcer */
  useGlobalAnnouncer?: boolean;
  /** ID for the live region */
  id?: string;
  /** Whether to show a visual indicator when content changes */
  showVisualIndicator?: boolean;
  /** Duration of the visual indicator in milliseconds */
  visualIndicatorDuration?: number;
}

/**
 * LiveRegion component for screen reader announcements
 *
 * @component
 * @example
 * <LiveRegion politeness="polite">
 *   Item added to cart
 * </LiveRegion>
 */
const LiveRegion: React.FC<LiveRegionProps> = ({
  children,
  politeness = 'polite',
  clearAfter,
  className = '',
  visuallyHidden = true,
  role,
  atomic = true,
  relevant = 'additions',
  useGlobalAnnouncer = false,
  id,
  showVisualIndicator = false,
  visualIndicatorDuration = 2000,
}) => {
  const regionRef = useRef<HTMLDivElement>(null);
  const { announce } = useAccessibility();
  const [showIndicator, setShowIndicator] = useState(false);
  const [content, setContent] = useState<React.ReactNode>(children);
  const previousContentRef = useRef<React.ReactNode>(children);

  // Generate a unique ID if not provided
  const uniqueId = id || `live-region-${React.useId()}`;

  // Update content and trigger announcements when children change
  useEffect(() => {
    // Only update if the content has changed
    if (children !== previousContentRef.current) {
      // Update the content
      setContent(children);
      previousContentRef.current = children;

      // Use global announcer if requested
      if (useGlobalAnnouncer && typeof children === 'string') {
        announce(children, politeness);
      }

      // Show visual indicator if requested
      if (showVisualIndicator) {
        setShowIndicator(true);

        const timer = setTimeout(() => {
          setShowIndicator(false);
        }, visualIndicatorDuration);

        return () => clearTimeout(timer);
      }
    }
  }, [children, announce, politeness, useGlobalAnnouncer, showVisualIndicator, visualIndicatorDuration]);

  // Clear the region after the specified time
  useEffect(() => {
    if (clearAfter && clearAfter > 0) {
      const timer = setTimeout(() => {
        setContent('');
      }, clearAfter);

      return () => clearTimeout(timer);
    }
  }, [content, clearAfter]);

  // Determine the appropriate ARIA role
  const ariaRole = role || (politeness === 'assertive' ? 'alert' : 'status');

  return (
    <div
      ref={regionRef}
      id={uniqueId}
      className={`
        ${visuallyHidden ? 'sr-only' : ''}
        ${showIndicator && !visuallyHidden ? 'bg-primary/10 dark:bg-primary/20 transition-colors duration-300' : ''}
        ${className}
      `}
      aria-live={politeness}
      role={ariaRole}
      aria-atomic={atomic}
      aria-relevant={relevant}
      data-testid={`live-region-${politeness}`}
    >
      {content}
    </div>
  );
};

/**
 * StatusMessage component for status announcements
 *
 * @component
 * @example
 * <StatusMessage>
 *   Your changes have been saved
 * </StatusMessage>
 */
export const StatusMessage: React.FC<Omit<LiveRegionProps, 'role' | 'politeness'>> = (props) => (
  <LiveRegion {...props} role="status" politeness="polite" />
);

/**
 * AlertMessage component for important announcements
 *
 * @component
 * @example
 * <AlertMessage>
 *   Error: Unable to save changes
 * </AlertMessage>
 */
export const AlertMessage: React.FC<Omit<LiveRegionProps, 'role' | 'politeness'>> = (props) => (
  <LiveRegion {...props} role="alert" politeness="assertive" />
);

/**
 * ProgressMessage component for progress announcements
 *
 * @component
 * @example
 * <ProgressMessage>
 *   Uploading: 50% complete
 * </ProgressMessage>
 */
export const ProgressMessage: React.FC<Omit<LiveRegionProps, 'role'> & { value?: number, max?: number }> = ({
  value,
  max = 100,
  children,
  ...props
}) => (
  <LiveRegion {...props} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
    {children}
  </LiveRegion>
);

/**
 * LogMessage component for log announcements
 *
 * @component
 * @example
 * <LogMessage>
 *   User logged in at 12:34 PM
 * </LogMessage>
 */
export const LogMessage: React.FC<Omit<LiveRegionProps, 'role' | 'relevant'>> = (props) => (
  <LiveRegion {...props} role="log" relevant="additions" />
);

export default LiveRegion;
