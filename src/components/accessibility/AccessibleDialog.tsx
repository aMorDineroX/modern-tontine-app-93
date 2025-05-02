import React, { useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FocusTrap from './FocusTrap';

interface AccessibleDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Function to call when the open state changes */
  onOpenChange: (open: boolean) => void;
  /** Dialog title */
  title: string;
  /** Dialog description */
  description?: string;
  /** Dialog content */
  children: React.ReactNode;
  /** Dialog footer content */
  footer?: React.ReactNode;
  /** Additional CSS classes for the dialog content */
  className?: string;
  /** Whether to announce the dialog opening to screen readers */
  announceOnOpen?: boolean;
  /** Whether to trap focus within the dialog */
  trapFocus?: boolean;
  /** Whether to close the dialog when the escape key is pressed */
  closeOnEscape?: boolean;
  /** Whether to close the dialog when clicking outside */
  closeOnOutsideClick?: boolean;
  /** ID for the dialog title element */
  titleId?: string;
  /** ID for the dialog description element */
  descriptionId?: string;
}

/**
 * AccessibleDialog component with enhanced accessibility features
 *
 * @component
 * @example
 * <AccessibleDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Dialog Title"
 *   description="Dialog description"
 * >
 *   <p>Dialog content</p>
 * </AccessibleDialog>
 */
const AccessibleDialog: React.FC<AccessibleDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className = '',
  announceOnOpen = true,
  trapFocus = true,
  closeOnEscape = true,
  closeOnOutsideClick = true,
  titleId,
  descriptionId,
}) => {
  const { announce } = useAccessibility();
  const initialFocusRef = useRef<HTMLButtonElement>(null);

  // Generate unique IDs for accessibility if not provided
  const uniqueTitleId = titleId || `dialog-title-${React.useId()}`;
  const uniqueDescriptionId = descriptionId || `dialog-description-${React.useId()}`;

  // Announce dialog opening to screen readers
  useEffect(() => {
    if (open && announceOnOpen) {
      announce(`Dialog opened: ${title}`);
    }
  }, [open, title, announce, announceOnOpen]);

  // Handle escape key
  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange, closeOnEscape]);

  // Set focus to the close button when the dialog opens
  useEffect(() => {
    if (open && trapFocus && initialFocusRef.current) {
      initialFocusRef.current.focus();
    }
  }, [open, trapFocus]);

  return (
    <Dialog
      open={open}
      onOpenChange={closeOnOutsideClick ? onOpenChange : undefined}
    >
      <DialogContent
        className={className}
        aria-labelledby={uniqueTitleId}
        aria-describedby={description ? uniqueDescriptionId : undefined}
        onInteractOutside={closeOnOutsideClick ? undefined : (e) => e.preventDefault()}
        onEscapeKeyDown={closeOnEscape ? undefined : (e) => e.preventDefault()}
      >
        <FocusTrap
          active={open && trapFocus}
          initialFocus={initialFocusRef}
          restoreFocus={true}
        >
          <div>
            <DialogHeader>
              <DialogTitle id={uniqueTitleId}>{title}</DialogTitle>
              {description && (
                <DialogDescription id={uniqueDescriptionId}>
                  {description}
                </DialogDescription>
              )}
            </DialogHeader>

            <div className="py-4">{children}</div>

            {footer && <DialogFooter>{footer}</DialogFooter>}

            <DialogClose asChild>
              <Button
                ref={initialFocusRef}
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </FocusTrap>
      </DialogContent>
    </Dialog>
  );
};

export default AccessibleDialog;
