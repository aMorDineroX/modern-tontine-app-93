import React, { useEffect, useRef } from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MenuItem {
  /** Unique key for the menu item */
  key: string;
  /** Menu item label */
  label: string;
  /** Function to call when the menu item is clicked */
  onClick?: () => void;
  /** Optional icon for the menu item */
  icon?: React.ReactNode;
  /** Whether the menu item is disabled */
  disabled?: boolean;
  /** Whether the menu item is destructive */
  destructive?: boolean;
  /** Additional CSS classes for the menu item */
  className?: string;
}

interface MenuGroup {
  /** Unique key for the menu group */
  key: string;
  /** Menu group label */
  label?: string;
  /** Menu items in the group */
  items: MenuItem[];
}

interface AccessibleDropdownMenuProps {
  /** Trigger element */
  trigger?: React.ReactNode;
  /** Trigger label (if using default trigger) */
  triggerLabel?: string;
  /** Menu items */
  items?: MenuItem[];
  /** Menu groups */
  groups?: MenuGroup[];
  /** Additional CSS classes for the dropdown menu */
  className?: string;
  /** Additional CSS classes for the dropdown menu content */
  contentClassName?: string;
  /** Whether the dropdown menu is open */
  open?: boolean;
  /** Function to call when the open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Whether to announce menu opening to screen readers */
  announceOnOpen?: boolean;
  /** Side to align the dropdown menu */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Alignment of the dropdown menu */
  align?: 'start' | 'center' | 'end';
}

/**
 * AccessibleDropdownMenu component with enhanced accessibility features
 * 
 * @component
 * @example
 * <AccessibleDropdownMenu
 *   triggerLabel="Options"
 *   items={[
 *     { key: 'edit', label: 'Edit', icon: <Pencil size={16} /> },
 *     { key: 'delete', label: 'Delete', destructive: true, icon: <Trash size={16} /> },
 *   ]}
 * />
 */
const AccessibleDropdownMenu: React.FC<AccessibleDropdownMenuProps> = ({
  trigger,
  triggerLabel = 'Menu',
  items = [],
  groups = [],
  className = '',
  contentClassName = '',
  open,
  onOpenChange,
  announceOnOpen = true,
  side = 'bottom',
  align = 'start',
}) => {
  const { announce } = useAccessibility();
  const [isOpen, setIsOpen] = React.useState(open || false);
  const firstItemRef = useRef<HTMLDivElement>(null);
  
  // Update internal state when controlled open state changes
  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);
  
  // Handle open state change
  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
    
    // Announce menu opening to screen readers
    if (newOpen && announceOnOpen) {
      announce(`${triggerLabel} menu opened`);
    }
  };
  
  // Focus the first menu item when the menu opens
  useEffect(() => {
    if (isOpen && firstItemRef.current) {
      setTimeout(() => {
        firstItemRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);
  
  // Render menu items
  const renderItems = (menuItems: MenuItem[], isFirstGroup = false) => {
    return menuItems.map((item, index) => (
      <DropdownMenuItem
        key={item.key}
        onClick={item.onClick}
        disabled={item.disabled}
        className={`flex items-center gap-2 ${item.destructive ? 'text-destructive' : ''} ${item.className || ''}`}
        ref={isFirstGroup && index === 0 ? firstItemRef : undefined}
        role="menuitem"
        aria-disabled={item.disabled}
      >
        {item.icon && <span className="menu-item-icon" aria-hidden="true">{item.icon}</span>}
        <span>{item.label}</span>
      </DropdownMenuItem>
    ));
  };
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            className={`flex items-center gap-2 ${className}`}
            aria-expanded={isOpen}
            aria-haspopup="menu"
          >
            <span>{triggerLabel}</span>
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </DropdownMenuTrigger>
      
      <DropdownMenuContent
        className={contentClassName}
        side={side}
        align={align}
        sideOffset={5}
        role="menu"
        aria-label={triggerLabel}
      >
        {/* Render items if no groups are provided */}
        {items.length > 0 && groups.length === 0 && renderItems(items, true)}
        
        {/* Render groups */}
        {groups.map((group, groupIndex) => (
          <React.Fragment key={group.key}>
            {/* Add separator between groups */}
            {groupIndex > 0 && <DropdownMenuSeparator />}
            
            {/* Group label */}
            {group.label && (
              <DropdownMenuLabel role="presentation">{group.label}</DropdownMenuLabel>
            )}
            
            {/* Group items */}
            <DropdownMenuGroup>
              {renderItems(group.items, groupIndex === 0)}
            </DropdownMenuGroup>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccessibleDropdownMenu;
