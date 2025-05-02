import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { renderWithProviders, testAccessibility } from '@/test/accessibility-test-utils';
import { screen, fireEvent, waitFor } from '@testing-library/react';

describe('Dialog Accessibility', () => {
  it('should have no accessibility violations when closed', async () => {
    const { container } = renderWithProviders(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog description</DialogDescription>
          </DialogHeader>
          <div>Dialog content</div>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
    await testAccessibility(container);
  });

  it('should have no accessibility violations when open', async () => {
    const { container } = renderWithProviders(
      <Dialog defaultOpen>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog description</DialogDescription>
          </DialogHeader>
          <div>Dialog content</div>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
    await testAccessibility(container);
  });

  it('should have proper ARIA attributes', async () => {
    renderWithProviders(
      <Dialog defaultOpen>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog description</DialogDescription>
          </DialogHeader>
          <div>Dialog content</div>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
    
    // Check for proper ARIA attributes
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-describedby');
    
    // Check that title and description are properly linked
    const titleId = dialog.getAttribute('aria-labelledby');
    const descriptionId = dialog.getAttribute('aria-describedby');
    
    const title = document.getElementById(titleId!);
    const description = document.getElementById(descriptionId!);
    
    expect(title).toHaveTextContent('Dialog Title');
    expect(description).toHaveTextContent('Dialog description');
  });

  it('should trap focus within the dialog', async () => {
    renderWithProviders(
      <Dialog defaultOpen>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog description</DialogDescription>
          </DialogHeader>
          <div>
            <Button>First Button</Button>
            <Button>Second Button</Button>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
    
    // Check that focus is trapped within the dialog
    const buttons = screen.getAllByRole('button');
    
    // Focus should be on the first focusable element in the dialog
    await waitFor(() => {
      expect(document.activeElement).toBe(buttons[0]);
    });
    
    // Tab to the next button
    fireEvent.keyDown(document.activeElement!, { key: 'Tab' });
    await waitFor(() => {
      expect(document.activeElement).toBe(buttons[1]);
    });
    
    // Tab to the close button
    fireEvent.keyDown(document.activeElement!, { key: 'Tab' });
    await waitFor(() => {
      expect(document.activeElement).toBe(buttons[2]);
    });
    
    // Tab should cycle back to the first button
    fireEvent.keyDown(document.activeElement!, { key: 'Tab' });
    await waitFor(() => {
      expect(document.activeElement).toBe(buttons[0]);
    });
  });

  it('should close when Escape key is pressed', async () => {
    renderWithProviders(
      <Dialog defaultOpen>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog description</DialogDescription>
          </DialogHeader>
          <div>Dialog content</div>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
    
    // Dialog should be open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    
    // Press Escape
    fireEvent.keyDown(document.body, { key: 'Escape' });
    
    // Dialog should be closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
