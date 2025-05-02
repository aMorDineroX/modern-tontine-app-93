import React from 'react';
import AccessibleTabs from '@/components/accessibility/AccessibleTabs';
import { renderWithProviders, testAccessibility } from '@/test/accessibility-test-utils';
import { screen, fireEvent } from '@testing-library/react';

describe('AccessibleTabs Accessibility', () => {
  const tabs = [
    { value: 'tab1', label: 'Tab 1', content: <div>Tab 1 content</div> },
    { value: 'tab2', label: 'Tab 2', content: <div>Tab 2 content</div> },
    { value: 'tab3', label: 'Tab 3', content: <div>Tab 3 content</div> },
  ];

  it('should have no accessibility violations', async () => {
    const { container } = renderWithProviders(
      <AccessibleTabs tabs={tabs} defaultValue="tab1" />
    );
    await testAccessibility(container);
  });

  it('should have proper ARIA attributes', () => {
    renderWithProviders(
      <AccessibleTabs tabs={tabs} defaultValue="tab1" />
    );
    
    // Check tablist
    const tablist = screen.getByRole('tablist');
    expect(tablist).toHaveAttribute('aria-orientation', 'horizontal');
    expect(tablist).toHaveAttribute('aria-label', 'Tabs');
    
    // Check tabs
    const tabButtons = screen.getAllByRole('tab');
    expect(tabButtons).toHaveLength(3);
    
    // Check first tab (selected)
    expect(tabButtons[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabButtons[0]).toHaveAttribute('aria-controls');
    
    // Check tab panels
    const tabPanels = screen.getAllByRole('tabpanel');
    expect(tabPanels).toHaveLength(1); // Only the active tab panel is rendered
    
    // Check that tab and panel are properly linked
    const tabId = tabButtons[0].id;
    const panelId = tabButtons[0].getAttribute('aria-controls');
    const panel = screen.getByRole('tabpanel');
    
    expect(panel.id).toBe(panelId);
    expect(panel).toHaveAttribute('aria-labelledby', tabId);
  });

  it('should be keyboard navigable', () => {
    const onValueChange = jest.fn();
    renderWithProviders(
      <AccessibleTabs 
        tabs={tabs} 
        defaultValue="tab1" 
        onValueChange={onValueChange} 
      />
    );
    
    const tabButtons = screen.getAllByRole('tab');
    
    // Focus the first tab
    tabButtons[0].focus();
    expect(document.activeElement).toBe(tabButtons[0]);
    
    // Press right arrow to move to next tab
    fireEvent.keyDown(tabButtons[0], { key: 'ArrowRight' });
    expect(document.activeElement).toBe(tabButtons[1]);
    
    // Press Enter to select the tab
    fireEvent.keyDown(tabButtons[1], { key: 'Enter' });
    expect(onValueChange).toHaveBeenCalledWith('tab2');
    
    // Press right arrow to move to last tab
    fireEvent.keyDown(tabButtons[1], { key: 'ArrowRight' });
    expect(document.activeElement).toBe(tabButtons[2]);
    
    // Press right arrow again should cycle back to first tab
    fireEvent.keyDown(tabButtons[2], { key: 'ArrowRight' });
    expect(document.activeElement).toBe(tabButtons[0]);
    
    // Press left arrow to move to last tab
    fireEvent.keyDown(tabButtons[0], { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(tabButtons[2]);
  });

  it('should announce tab changes to screen readers', () => {
    const announceMock = jest.fn();
    jest.spyOn(React, 'useContext').mockImplementation(() => ({
      announce: announceMock,
      announcements: [],
      clearAnnouncements: jest.fn(),
      highContrast: false,
      toggleHighContrast: jest.fn(),
      fontSize: 'normal',
      setFontSize: jest.fn(),
      reducedMotion: false,
      toggleReducedMotion: jest.fn(),
    }));
    
    renderWithProviders(
      <AccessibleTabs tabs={tabs} defaultValue="tab1" />
    );
    
    const tabButtons = screen.getAllByRole('tab');
    
    // Click the second tab
    fireEvent.click(tabButtons[1]);
    
    // Check that the announcement was made
    expect(announceMock).toHaveBeenCalledWith('Tab changed to Tab 2');
  });
});
