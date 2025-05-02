import React from 'react';

interface SkipToContentProps {
  /** The ID of the main content element to skip to */
  contentId?: string;
  /** The text to display in the skip link */
  label?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * SkipToContent component for keyboard users to skip navigation
 * 
 * @component
 * @example
 * <SkipToContent contentId="main-content" />
 */
const SkipToContent: React.FC<SkipToContentProps> = ({
  contentId = 'main-content',
  label = 'Skip to main content',
  className = '',
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    // Find the target element
    const targetElement = document.getElementById(contentId);
    
    if (targetElement) {
      // Set focus to the target element
      targetElement.setAttribute('tabindex', '-1');
      targetElement.focus();
      
      // Remove tabindex after focus to prevent unexpected tab order
      setTimeout(() => {
        targetElement.removeAttribute('tabindex');
      }, 1000);
    }
  };
  
  return (
    <a
      href={`#${contentId}`}
      className={`skip-link ${className}`}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleClick(e as unknown as React.MouseEvent<HTMLAnchorElement>);
        }
      }}
    >
      {label}
    </a>
  );
};

export default SkipToContent;
