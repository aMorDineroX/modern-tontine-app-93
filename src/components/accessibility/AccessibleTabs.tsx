import React, { useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAccessibility } from '@/contexts/AccessibilityContext';

interface TabItem {
  /** Unique value for the tab */
  value: string;
  /** Tab label */
  label: string;
  /** Tab content */
  content: React.ReactNode;
  /** Optional icon for the tab */
  icon?: React.ReactNode;
  /** Whether the tab is disabled */
  disabled?: boolean;
}

interface AccessibleTabsProps {
  /** Array of tab items */
  tabs: TabItem[];
  /** Default selected tab value */
  defaultValue?: string;
  /** Current selected tab value (controlled) */
  value?: string;
  /** Function to call when the selected tab changes */
  onValueChange?: (value: string) => void;
  /** Additional CSS classes for the tabs container */
  className?: string;
  /** Additional CSS classes for the tabs list */
  tabsListClassName?: string;
  /** Additional CSS classes for the tab triggers */
  tabTriggerClassName?: string;
  /** Additional CSS classes for the tab content */
  tabContentClassName?: string;
  /** Whether to announce tab changes to screen readers */
  announceTabChange?: boolean;
  /** ID for the tabs component */
  id?: string;
  /** Orientation of the tabs */
  orientation?: 'horizontal' | 'vertical';
}

/**
 * AccessibleTabs component with enhanced accessibility features
 * 
 * @component
 * @example
 * <AccessibleTabs
 *   tabs={[
 *     { value: 'tab1', label: 'Tab 1', content: <div>Tab 1 content</div> },
 *     { value: 'tab2', label: 'Tab 2', content: <div>Tab 2 content</div> },
 *   ]}
 *   defaultValue="tab1"
 * />
 */
const AccessibleTabs: React.FC<AccessibleTabsProps> = ({
  tabs,
  defaultValue,
  value,
  onValueChange,
  className = '',
  tabsListClassName = '',
  tabTriggerClassName = '',
  tabContentClassName = '',
  announceTabChange = true,
  id,
  orientation = 'horizontal',
}) => {
  const { announce } = useAccessibility();
  const [selectedTab, setSelectedTab] = React.useState<string>(
    value || defaultValue || tabs[0]?.value || ''
  );
  
  // Generate unique ID for accessibility
  const uniqueId = id || `tabs-${React.useId()}`;
  
  // Update internal state when controlled value changes
  useEffect(() => {
    if (value !== undefined) {
      setSelectedTab(value);
    }
  }, [value]);
  
  // Handle tab change
  const handleTabChange = (newValue: string) => {
    setSelectedTab(newValue);
    
    if (onValueChange) {
      onValueChange(newValue);
    }
    
    // Announce tab change to screen readers
    if (announceTabChange) {
      const selectedTabLabel = tabs.find(tab => tab.value === newValue)?.label;
      announce(`Tab changed to ${selectedTabLabel}`);
    }
  };
  
  return (
    <Tabs
      defaultValue={defaultValue}
      value={selectedTab}
      onValueChange={handleTabChange}
      className={className}
      orientation={orientation === 'vertical' ? 'vertical' : undefined}
      id={uniqueId}
    >
      <TabsList 
        className={tabsListClassName}
        aria-label="Tabs"
        role="tablist"
        aria-orientation={orientation}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={`flex items-center gap-2 ${tabTriggerClassName}`}
            disabled={tab.disabled}
            role="tab"
            aria-selected={selectedTab === tab.value}
            aria-controls={`${uniqueId}-${tab.value}`}
            id={`${uniqueId}-tab-${tab.value}`}
          >
            {tab.icon && <span className="tab-icon" aria-hidden="true">{tab.icon}</span>}
            <span>{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      
      {tabs.map((tab) => (
        <TabsContent
          key={tab.value}
          value={tab.value}
          className={tabContentClassName}
          role="tabpanel"
          aria-labelledby={`${uniqueId}-tab-${tab.value}`}
          id={`${uniqueId}-${tab.value}`}
          tabIndex={0}
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default AccessibleTabs;
