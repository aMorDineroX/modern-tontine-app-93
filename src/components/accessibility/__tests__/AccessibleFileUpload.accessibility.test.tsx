import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';
import AccessibleFileUpload from '@/components/accessibility/AccessibleFileUpload';
import { renderWithProviders, testAccessibility } from '@/test/accessibility-test-utils';

// Mock file for testing
const createMockFile = (name: string, type: string, size: number) => {
  const file = new File(["mock file content"], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('AccessibleFileUpload Accessibility', () => {
  it('should have no accessibility violations in initial state', async () => {
    const { container } = renderWithProviders(
      <AccessibleFileUpload
        label="Upload Files"
        helperText="Accepted file types: JPG, PNG, PDF"
      />
    );
    await testAccessibility(container);
  });

  it('should have no accessibility violations with files selected', async () => {
    const { container } = renderWithProviders(
      <AccessibleFileUpload
        label="Upload Files"
        helperText="Accepted file types: JPG, PNG, PDF"
      />
    );
    
    // Mock file selection
    const file = createMockFile('test.jpg', 'image/jpeg', 1024 * 50);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    
    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
      });
      
      fireEvent.change(input);
    }
    
    await testAccessibility(container);
  });

  it('should have no accessibility violations in error state', async () => {
    const { container } = renderWithProviders(
      <AccessibleFileUpload
        label="Upload Files"
        helperText="Accepted file types: JPG, PNG, PDF"
        error="Please select a valid file"
      />
    );
    await testAccessibility(container);
  });

  it('should have no accessibility violations in disabled state', async () => {
    const { container } = renderWithProviders(
      <AccessibleFileUpload
        label="Upload Files"
        helperText="Accepted file types: JPG, PNG, PDF"
        disabled
      />
    );
    await testAccessibility(container);
  });

  it('should have proper ARIA attributes', () => {
    renderWithProviders(
      <AccessibleFileUpload
        label="Upload Files"
        helperText="Accepted file types: JPG, PNG, PDF"
        required
        id="file-upload-test"
      />
    );
    
    // Check file input attributes
    const input = screen.getByLabelText('Upload Files', { exact: false });
    expect(input).toHaveAttribute('aria-required', 'true');
    
    // Check that the input is associated with the label
    const label = screen.getByText('Upload Files');
    expect(label).toHaveAttribute('for', 'file-upload-test');
    
    // Check that the input is associated with the helper text
    const helperText = screen.getByText('Accepted file types: JPG, PNG, PDF');
    expect(input).toHaveAttribute('aria-describedby');
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(helperText.id).toBe(describedBy);
  });

  it('should announce file selection to screen readers', async () => {
    const announceMock = jest.fn();
    jest.spyOn(React, 'useContext').mockImplementation(() => ({
      announce: announceMock,
      announcements: [],
      clearAnnouncements: jest.fn(),
      highContrast: false,
      toggleHighContrast: jest.fn(),
      fontSize: 'normal',
      setFontSize: jest.fn(),
      reducedMotion: true, // Set to true to speed up tests
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
    
    const { container } = renderWithProviders(
      <AccessibleFileUpload
        label="Upload Files"
        announceChanges
      />
    );
    
    // Mock file selection
    const file = createMockFile('test.jpg', 'image/jpeg', 1024 * 50);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    
    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
      });
      
      fireEvent.change(input);
    }
    
    // Check that the announcement was made
    expect(announceMock).toHaveBeenCalledWith('File "test.jpg" selected');
  });

  it('should announce file removal to screen readers', async () => {
    const announceMock = jest.fn();
    jest.spyOn(React, 'useContext').mockImplementation(() => ({
      announce: announceMock,
      announcements: [],
      clearAnnouncements: jest.fn(),
      highContrast: false,
      toggleHighContrast: jest.fn(),
      fontSize: 'normal',
      setFontSize: jest.fn(),
      reducedMotion: true, // Set to true to speed up tests
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
    
    const { container } = renderWithProviders(
      <AccessibleFileUpload
        label="Upload Files"
        announceChanges
      />
    );
    
    // Mock file selection
    const file = createMockFile('test.jpg', 'image/jpeg', 1024 * 50);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    
    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
      });
      
      fireEvent.change(input);
    }
    
    // Wait for the file to be added to the list
    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument();
    });
    
    // Clear the mock to check for the removal announcement
    announceMock.mockClear();
    
    // Remove the file
    const removeButton = screen.getByLabelText('Remove test.jpg');
    fireEvent.click(removeButton);
    
    // Check that the announcement was made
    expect(announceMock).toHaveBeenCalledWith('File "test.jpg" removed');
  });

  it('should announce upload progress to screen readers', async () => {
    const announceMock = jest.fn();
    jest.spyOn(React, 'useContext').mockImplementation(() => ({
      announce: announceMock,
      announcements: [],
      clearAnnouncements: jest.fn(),
      highContrast: false,
      toggleHighContrast: jest.fn(),
      fontSize: 'normal',
      setFontSize: jest.fn(),
      reducedMotion: true, // Set to true to speed up tests
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
    
    const { container } = renderWithProviders(
      <AccessibleFileUpload
        label="Upload Files"
        announceChanges
        autoUpload
      />
    );
    
    // Mock file selection
    const file = createMockFile('test.jpg', 'image/jpeg', 1024 * 50);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    
    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
      });
      
      fireEvent.change(input);
    }
    
    // Wait for the upload to start
    await waitFor(() => {
      expect(announceMock).toHaveBeenCalledWith('Uploading file "test.jpg"');
    });
    
    // Wait for the progress announcement
    await waitFor(() => {
      expect(announceMock).toHaveBeenCalledWith('File "test.jpg" is 50% uploaded');
    }, { timeout: 2000 });
    
    // Wait for the completion announcement
    await waitFor(() => {
      expect(announceMock).toHaveBeenCalledWith(expect.stringContaining('uploaded successfully'));
    }, { timeout: 3000 });
  });

  it('should handle drag and drop with proper announcements', async () => {
    const announceMock = jest.fn();
    jest.spyOn(React, 'useContext').mockImplementation(() => ({
      announce: announceMock,
      announcements: [],
      clearAnnouncements: jest.fn(),
      highContrast: false,
      toggleHighContrast: jest.fn(),
      fontSize: 'normal',
      setFontSize: jest.fn(),
      reducedMotion: true,
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
      <AccessibleFileUpload
        label="Upload Files"
        announceChanges
        dragAndDrop
      />
    );
    
    // Find the drop zone
    const dropZone = screen.getByText('Click to upload').closest('div');
    expect(dropZone).toBeTruthy();
    
    if (dropZone) {
      // Simulate drag enter
      fireEvent.dragEnter(dropZone);
      
      // Check that the announcement was made
      expect(announceMock).toHaveBeenCalledWith('Files detected. Drop to upload.');
      
      // Simulate drop
      const file = createMockFile('test.jpg', 'image/jpeg', 1024 * 50);
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file],
        },
      });
      
      // Check that the file selection announcement was made
      await waitFor(() => {
        expect(announceMock).toHaveBeenCalledWith('File "test.jpg" selected');
      });
    }
  });

  it('should handle error state with proper ARIA attributes', () => {
    renderWithProviders(
      <AccessibleFileUpload
        label="Upload Files"
        error="Please select a valid file"
      />
    );
    
    // Check file input attributes
    const input = screen.getByLabelText('Upload Files', { exact: false });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    
    // Check that the input is associated with the error message
    const errorMessage = screen.getByText('Please select a valid file');
    expect(input).toHaveAttribute('aria-describedby');
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(errorMessage.id).toBe(describedBy);
  });

  it('should handle file size limits with proper announcements', async () => {
    const announceMock = jest.fn();
    jest.spyOn(React, 'useContext').mockImplementation(() => ({
      announce: announceMock,
      announcements: [],
      clearAnnouncements: jest.fn(),
      highContrast: false,
      toggleHighContrast: jest.fn(),
      fontSize: 'normal',
      setFontSize: jest.fn(),
      reducedMotion: true,
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
    
    const { container } = renderWithProviders(
      <AccessibleFileUpload
        label="Upload Files"
        announceChanges
        maxSize={1024 * 10} // 10KB
      />
    );
    
    // Mock file selection with a file that exceeds the size limit
    const file = createMockFile('large.jpg', 'image/jpeg', 1024 * 100); // 100KB
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    
    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
      });
      
      fireEvent.change(input);
    }
    
    // Check that the error announcement was made
    expect(announceMock).toHaveBeenCalledWith(expect.stringContaining('exceeds the maximum size'));
  });
});
