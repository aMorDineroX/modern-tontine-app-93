import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { LiveRegion } from './LiveRegion';

export interface ComboboxItem {
  /** Unique value for the item */
  value: string;
  /** Label to display for the item */
  label: string;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Additional data for the item */
  data?: any;
}

interface AccessibleComboboxProps {
  /** Items to display in the combobox */
  items: ComboboxItem[];
  /** Selected value */
  value?: string;
  /** Function to call when the value changes */
  onValueChange?: (value: string) => void;
  /** Placeholder text for the combobox */
  placeholder?: string;
  /** Placeholder text for the search input */
  searchPlaceholder?: string;
  /** Text to display when no items match the search */
  emptyText?: string;
  /** Whether the combobox is disabled */
  disabled?: boolean;
  /** Whether the combobox allows multiple selections */
  multiple?: boolean;
  /** Selected values (for multiple selection) */
  selectedValues?: string[];
  /** Function to call when the selected values change (for multiple selection) */
  onSelectedValuesChange?: (values: string[]) => void;
  /** Whether to clear the search input when an item is selected */
  clearSearchOnSelect?: boolean;
  /** Additional CSS classes for the combobox */
  className?: string;
  /** Label for the combobox */
  label?: string;
  /** Whether the combobox is required */
  required?: boolean;
  /** Error message to display */
  error?: string;
  /** ID for the combobox */
  id?: string;
  /** Whether to announce selection changes to screen readers */
  announceChanges?: boolean;
}

/**
 * AccessibleCombobox component with enhanced accessibility features
 * 
 * @component
 * @example
 * <AccessibleCombobox
 *   items={[
 *     { value: 'apple', label: 'Apple' },
 *     { value: 'banana', label: 'Banana' },
 *     { value: 'orange', label: 'Orange' },
 *   ]}
 *   placeholder="Select a fruit"
 *   onValueChange={(value) => console.log(value)}
 * />
 */
const AccessibleCombobox: React.FC<AccessibleComboboxProps> = ({
  items,
  value,
  onValueChange,
  placeholder = 'Select an option',
  searchPlaceholder = 'Search...',
  emptyText = 'No results found.',
  disabled = false,
  multiple = false,
  selectedValues = [],
  onSelectedValuesChange,
  clearSearchOnSelect = true,
  className = '',
  label,
  required = false,
  error,
  id,
  announceChanges = true,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>(selectedValues);
  const [announcement, setAnnouncement] = useState<string>('');
  const { announce } = useAccessibility();
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  
  // Generate a unique ID for the combobox
  const uniqueId = id || `combobox-${React.useId()}`;
  const labelId = `${uniqueId}-label`;
  const errorId = `${uniqueId}-error`;
  
  // Update internal state when controlled values change
  useEffect(() => {
    if (multiple) {
      setSelectedItems(selectedValues);
    }
  }, [multiple, selectedValues]);
  
  // Get the selected item label
  const getSelectedItemLabel = () => {
    if (multiple) {
      return selectedItems.length > 0
        ? `${selectedItems.length} selected`
        : placeholder;
    }
    
    const selectedItem = items.find(item => item.value === value);
    return selectedItem ? selectedItem.label : placeholder;
  };
  
  // Handle item selection
  const handleSelect = (itemValue: string) => {
    if (multiple) {
      let newSelectedItems: string[];
      
      if (selectedItems.includes(itemValue)) {
        newSelectedItems = selectedItems.filter(i => i !== itemValue);
      } else {
        newSelectedItems = [...selectedItems, itemValue];
      }
      
      setSelectedItems(newSelectedItems);
      
      if (onSelectedValuesChange) {
        onSelectedValuesChange(newSelectedItems);
      }
      
      // Announce selection change
      const item = items.find(i => i.value === itemValue);
      if (item) {
        const action = selectedItems.includes(itemValue) ? 'removed from' : 'added to';
        const message = `${item.label} ${action} selection`;
        setAnnouncement(message);
        if (announceChanges) {
          announce(message);
        }
      }
      
      // Keep the popover open for multiple selection
      if (clearSearchOnSelect) {
        setSearch('');
      }
      
      // Focus back on the input
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } else {
      if (onValueChange) {
        onValueChange(itemValue);
      }
      
      // Announce selection change
      const item = items.find(i => i.value === itemValue);
      if (item) {
        const message = `Selected ${item.label}`;
        setAnnouncement(message);
        if (announceChanges) {
          announce(message);
        }
      }
      
      setOpen(false);
      
      // Focus back on the trigger button
      if (triggerRef.current) {
        triggerRef.current.focus();
      }
    }
  };
  
  // Handle removing a selected item (for multiple selection)
  const handleRemoveItem = (itemValue: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    if (multiple) {
      const newSelectedItems = selectedItems.filter(i => i !== itemValue);
      setSelectedItems(newSelectedItems);
      
      if (onSelectedValuesChange) {
        onSelectedValuesChange(newSelectedItems);
      }
      
      // Announce removal
      const item = items.find(i => i.value === itemValue);
      if (item) {
        const message = `Removed ${item.label} from selection`;
        setAnnouncement(message);
        if (announceChanges) {
          announce(message);
        }
      }
    }
  };
  
  // Handle key down events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Open the popover on arrow down
    if (e.key === 'ArrowDown' && !open) {
      e.preventDefault();
      setOpen(true);
    }
    
    // Close the popover on escape
    if (e.key === 'Escape' && open) {
      e.preventDefault();
      setOpen(false);
      
      // Focus back on the trigger button
      if (triggerRef.current) {
        triggerRef.current.focus();
      }
    }
  };
  
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label
          id={labelId}
          htmlFor={uniqueId}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            id={uniqueId}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-labelledby={label ? labelId : undefined}
            aria-describedby={error ? errorId : undefined}
            aria-invalid={!!error}
            aria-required={required}
            className={cn(
              'w-full justify-between',
              error && 'border-destructive',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            onClick={() => !disabled && setOpen(!open)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
          >
            {multiple && selectedItems.length > 0 ? (
              <div className="flex flex-wrap gap-1 max-w-[90%] overflow-hidden">
                {selectedItems.slice(0, 3).map(itemValue => {
                  const item = items.find(i => i.value === itemValue);
                  return item ? (
                    <div
                      key={item.value}
                      className="flex items-center bg-muted text-muted-foreground rounded-sm px-1 py-0.5 text-xs"
                    >
                      <span className="truncate max-w-[100px]">{item.label}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 p-0"
                        onClick={(e) => handleRemoveItem(item.value, e)}
                        aria-label={`Remove ${item.label}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : null;
                })}
                {selectedItems.length > 3 && (
                  <div className="flex items-center bg-muted text-muted-foreground rounded-sm px-1 py-0.5 text-xs">
                    +{selectedItems.length - 3} more
                  </div>
                )}
              </div>
            ) : (
              <span className="truncate">{getSelectedItemLabel()}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start" sideOffset={5}>
          <Command shouldFilter={false}>
            <CommandInput
              ref={inputRef}
              placeholder={searchPlaceholder}
              value={search}
              onValueChange={setSearch}
              className="h-9"
              aria-autocomplete="list"
            />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {items
                  .filter(item => 
                    item.label.toLowerCase().includes(search.toLowerCase())
                  )
                  .map(item => {
                    const isSelected = multiple
                      ? selectedItems.includes(item.value)
                      : item.value === value;
                    
                    return (
                      <CommandItem
                        key={item.value}
                        value={item.value}
                        onSelect={handleSelect}
                        disabled={item.disabled}
                        className={cn(
                          item.disabled && 'opacity-50 cursor-not-allowed',
                          'aria-selected:bg-primary aria-selected:text-primary-foreground'
                        )}
                        role="option"
                        aria-selected={isSelected}
                      >
                        {multiple && (
                          <div
                            className={cn(
                              'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                              isSelected
                                ? 'bg-primary text-primary-foreground'
                                : 'opacity-50'
                            )}
                          >
                            {isSelected && <Check className="h-3 w-3" aria-hidden="true" />}
                          </div>
                        )}
                        <span>{item.label}</span>
                        {!multiple && isSelected && (
                          <Check className="ml-auto h-4 w-4" aria-hidden="true" />
                        )}
                      </CommandItem>
                    );
                  })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {error && (
        <p id={errorId} className="text-sm text-destructive mt-1">
          {error}
        </p>
      )}
      
      {/* Live region for announcements */}
      <LiveRegion politeness="polite" clearAfter={3000}>
        {announcement}
      </LiveRegion>
    </div>
  );
};

export default AccessibleCombobox;
