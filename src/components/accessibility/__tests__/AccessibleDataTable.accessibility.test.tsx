import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';
import AccessibleDataTable from '@/components/accessibility/AccessibleDataTable';
import { renderWithProviders, testAccessibility } from '@/test/accessibility-test-utils';
import { keyboardInteractions } from '@/test/accessibility-test-setup';

describe('AccessibleDataTable Accessibility', () => {
  // Sample data for testing
  const data = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'User' },
    { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'Admin' },
  ];

  // Column definitions
  const columns = [
    { id: 'name', header: 'Name', accessor: (row: any) => row.name, sortable: true, searchable: true },
    { id: 'email', header: 'Email', accessor: (row: any) => row.email, sortable: true, searchable: true },
    { id: 'role', header: 'Role', accessor: (row: any) => row.role, sortable: true, searchable: true },
  ];

  it('should have no accessibility violations', async () => {
    const { container } = renderWithProviders(
      <AccessibleDataTable
        data={data}
        columns={columns}
        caption="Users Table"
      />
    );
    await testAccessibility(container);
  });

  it('should have no accessibility violations with pagination', async () => {
    const { container } = renderWithProviders(
      <AccessibleDataTable
        data={data}
        columns={columns}
        caption="Users Table"
        pagination
        pageSize={2}
      />
    );
    await testAccessibility(container);
  });

  it('should have no accessibility violations with sorting', async () => {
    const { container } = renderWithProviders(
      <AccessibleDataTable
        data={data}
        columns={columns}
        caption="Users Table"
        sortable
      />
    );
    
    // Click to sort a column
    fireEvent.click(screen.getByText('Name'));
    
    await testAccessibility(container);
  });

  it('should have no accessibility violations with searching', async () => {
    const { container } = renderWithProviders(
      <AccessibleDataTable
        data={data}
        columns={columns}
        caption="Users Table"
        searchable
      />
    );
    
    // Enter search text
    const searchInput = screen.getByRole('textbox');
    fireEvent.change(searchInput, { target: { value: 'John' } });
    
    await testAccessibility(container);
  });

  it('should have no accessibility violations with selection', async () => {
    const { container } = renderWithProviders(
      <AccessibleDataTable
        data={data}
        columns={columns}
        caption="Users Table"
        selectable
      />
    );
    
    // Select a row
    const checkbox = screen.getAllByRole('checkbox')[1]; // First row checkbox
    fireEvent.click(checkbox);
    
    await testAccessibility(container);
  });

  it('should have proper ARIA attributes', () => {
    renderWithProviders(
      <AccessibleDataTable
        data={data}
        columns={columns}
        caption="Users Table"
        pagination
        sortable
        searchable
      />
    );
    
    // Check table attributes
    const table = screen.getByRole('table');
    expect(table).toHaveAttribute('aria-labelledby');
    expect(table).toHaveAttribute('aria-rowcount');
    expect(table).toHaveAttribute('aria-colcount');
    
    // Check column headers
    const columnHeaders = screen.getAllByRole('columnheader');
    expect(columnHeaders).toHaveLength(columns.length);
    
    // Check sortable column
    const nameHeader = screen.getByText('Name').closest('th');
    expect(nameHeader).toHaveAttribute('aria-sort', 'none');
    
    // Check search input
    const searchInput = screen.getByRole('textbox');
    expect(searchInput).toHaveAttribute('aria-controls');
  });

  it('should announce sort changes to screen readers', async () => {
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
      enhancedFocus: false,
      toggleEnhancedFocus: jest.fn(),
      enhancedTextSpacing: false,
      toggleEnhancedTextSpacing: jest.fn(),
      dyslexiaFriendly: false,
      toggleDyslexiaFriendly: jest.fn(),
      keyboardMode: false,
      setKeyboardMode: jest.fn(),
      screenReaderHints: false,
      toggleScreenReaderHints: jest.fn(),
    }));
    
    renderWithProviders(
      <AccessibleDataTable
        data={data}
        columns={columns}
        caption="Users Table"
        sortable
      />
    );
    
    // Click to sort a column
    fireEvent.click(screen.getByText('Name'));
    
    // Check that the announcement was made
    expect(announceMock).toHaveBeenCalledWith('Sorted by Name ascending');
    
    // Click again to reverse sort
    fireEvent.click(screen.getByText('Name'));
    
    // Check that the announcement was made
    expect(announceMock).toHaveBeenCalledWith('Sorted by Name descending');
  });

  it('should announce page changes to screen readers', async () => {
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
      enhancedFocus: false,
      toggleEnhancedFocus: jest.fn(),
      enhancedTextSpacing: false,
      toggleEnhancedTextSpacing: jest.fn(),
      dyslexiaFriendly: false,
      toggleDyslexiaFriendly: jest.fn(),
      keyboardMode: false,
      setKeyboardMode: jest.fn(),
      screenReaderHints: false,
      toggleScreenReaderHints: jest.fn(),
    }));
    
    renderWithProviders(
      <AccessibleDataTable
        data={data}
        columns={columns}
        caption="Users Table"
        pagination
        pageSize={2}
      />
    );
    
    // Click next page button
    fireEvent.click(screen.getByLabelText('Next page'));
    
    // Check that the announcement was made
    expect(announceMock).toHaveBeenCalledWith('Page 2 of 3');
  });

  it('should announce search results to screen readers', async () => {
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
      enhancedFocus: false,
      toggleEnhancedFocus: jest.fn(),
      enhancedTextSpacing: false,
      toggleEnhancedTextSpacing: jest.fn(),
      dyslexiaFriendly: false,
      toggleDyslexiaFriendly: jest.fn(),
      keyboardMode: false,
      setKeyboardMode: jest.fn(),
      screenReaderHints: false,
      toggleScreenReaderHints: jest.fn(),
    }));
    
    renderWithProviders(
      <AccessibleDataTable
        data={data}
        columns={columns}
        caption="Users Table"
        searchable
      />
    );
    
    // Enter search text
    const searchInput = screen.getByRole('textbox');
    fireEvent.change(searchInput, { target: { value: 'John' } });
    
    // Wait for the debounced announcement
    await waitFor(() => {
      expect(announceMock).toHaveBeenCalledWith('Found 1 result for "John"');
    });
    
    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    
    // Wait for the debounced announcement
    await waitFor(() => {
      expect(announceMock).toHaveBeenCalledWith('Search cleared, showing all 5 rows');
    });
  });

  it('should be keyboard navigable', async () => {
    renderWithProviders(
      <AccessibleDataTable
        data={data}
        columns={columns}
        caption="Users Table"
        keyboardNavigation
      />
    );
    
    // Find the first cell
    const firstCell = screen.getByText('John Doe').closest('td');
    
    // Focus the cell
    if (firstCell) {
      firstCell.focus();
      expect(document.activeElement).toBe(firstCell);
      
      // Navigate right
      fireEvent.keyDown(firstCell, keyboardInteractions.arrowRight);
      
      // Check that focus moved to the next cell
      await waitFor(() => {
        expect(document.activeElement).toHaveTextContent('john@example.com');
      });
      
      // Navigate down
      fireEvent.keyDown(document.activeElement!, keyboardInteractions.arrowDown);
      
      // Check that focus moved to the cell below
      await waitFor(() => {
        expect(document.activeElement).toHaveTextContent('jane@example.com');
      });
    }
  });

  it('should handle empty state correctly', async () => {
    renderWithProviders(
      <AccessibleDataTable
        data={[]}
        columns={columns}
        caption="Users Table"
        emptyMessage="No users found."
      />
    );
    
    // Check that the empty message is displayed
    expect(screen.getByText('No users found.')).toBeInTheDocument();
  });

  it('should handle error state correctly', async () => {
    renderWithProviders(
      <AccessibleDataTable
        data={[]}
        columns={columns}
        caption="Users Table"
        error="Failed to load users."
      />
    );
    
    // Check that the error message is displayed
    expect(screen.getByText('Failed to load users.')).toBeInTheDocument();
  });

  it('should handle loading state correctly', async () => {
    renderWithProviders(
      <AccessibleDataTable
        data={[]}
        columns={columns}
        caption="Users Table"
        loading
      />
    );
    
    // Check that the loading indicator is displayed
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
