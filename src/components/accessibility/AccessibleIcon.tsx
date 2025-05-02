import React from 'react';

interface AccessibleIconProps {
  /** The icon component */
  icon: React.ReactElement;
  /** Description of the icon for screen readers */
  label: string;
  /** Whether to hide the icon from screen readers */
  hideFromScreenReaders?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Additional props to pass to the icon */
  iconProps?: Record<string, any>;
}

/**
 * AccessibleIcon component for making icons accessible
 * 
 * @component
 * @example
 * <AccessibleIcon
 *   icon={<Star />}
 *   label="Favorite"
 * />
 */
const AccessibleIcon: React.FC<AccessibleIconProps> = ({
  icon,
  label,
  hideFromScreenReaders = false,
  className = '',
  iconProps = {},
}) => {
  if (hideFromScreenReaders) {
    return (
      <span className={className} aria-hidden="true" {...iconProps}>
        {React.cloneElement(icon, { 'aria-hidden': 'true' })}
      </span>
    );
  }
  
  return (
    <span className={`inline-flex ${className}`} role="img" aria-label={label} {...iconProps}>
      {React.cloneElement(icon, { 'aria-hidden': 'true' })}
      <span className="sr-only">{label}</span>
    </span>
  );
};

export default AccessibleIcon;
