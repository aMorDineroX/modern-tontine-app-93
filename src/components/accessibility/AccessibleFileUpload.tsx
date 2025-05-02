import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, File, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { LiveRegion } from './LiveRegion';

interface FileWithPreview extends File {
  /** Preview URL for the file */
  preview?: string;
  /** Upload progress (0-100) */
  progress?: number;
  /** Upload status */
  status?: 'idle' | 'uploading' | 'success' | 'error';
  /** Error message */
  error?: string;
  /** Unique ID for the file */
  id: string;
}

interface AccessibleFileUploadProps {
  /** Function to call when files are selected */
  onFilesSelected?: (files: File[]) => void;
  /** Function to call when a file is removed */
  onFileRemoved?: (file: File) => void;
  /** Function to call when all files are removed */
  onAllFilesRemoved?: () => void;
  /** Function to call when a file upload starts */
  onUploadStart?: (file: File) => void;
  /** Function to call when a file upload progresses */
  onUploadProgress?: (file: File, progress: number) => void;
  /** Function to call when a file upload completes */
  onUploadComplete?: (file: File) => void;
  /** Function to call when a file upload fails */
  onUploadError?: (file: File, error: string) => void;
  /** Whether to accept multiple files */
  multiple?: boolean;
  /** Accepted file types */
  accept?: string;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Maximum number of files */
  maxFiles?: number;
  /** Whether to show file previews */
  showPreviews?: boolean;
  /** Whether to enable drag and drop */
  dragAndDrop?: boolean;
  /** Whether to automatically upload files */
  autoUpload?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Label for the upload button */
  uploadButtonLabel?: string;
  /** Label for the remove button */
  removeButtonLabel?: string;
  /** Label for the clear all button */
  clearAllButtonLabel?: string;
  /** Text to display when no files are selected */
  noFilesText?: string;
  /** Text to display when dragging files over the drop zone */
  dropText?: string;
  /** ID for the file input */
  id?: string;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Whether to announce changes to screen readers */
  announceChanges?: boolean;
  /** Error message to display */
  error?: string;
  /** Helper text to display */
  helperText?: string;
  /** Label for the file input */
  label?: string;
  /** Whether the file input is required */
  required?: boolean;
}

/**
 * AccessibleFileUpload component with enhanced accessibility features
 * 
 * @component
 * @example
 * <AccessibleFileUpload
 *   onFilesSelected={(files) => console.log(files)}
 *   multiple
 *   accept="image/*"
 *   maxSize={5 * 1024 * 1024}
 *   maxFiles={5}
 *   showPreviews
 *   dragAndDrop
 * />
 */
const AccessibleFileUpload: React.FC<AccessibleFileUploadProps> = ({
  onFilesSelected,
  onFileRemoved,
  onAllFilesRemoved,
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
  multiple = false,
  accept,
  maxSize,
  maxFiles = 10,
  showPreviews = true,
  dragAndDrop = true,
  autoUpload = false,
  className = '',
  uploadButtonLabel = 'Upload',
  removeButtonLabel = 'Remove',
  clearAllButtonLabel = 'Clear All',
  noFilesText = 'No files selected',
  dropText = 'Drop files here',
  id,
  disabled = false,
  announceChanges = true,
  error,
  helperText,
  label = 'Upload files',
  required = false,
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [announcement, setAnnouncement] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  
  const { announce, reducedMotion } = useAccessibility();
  
  // Generate a unique ID for the file input
  const uniqueId = id || `file-upload-${React.useId()}`;
  const labelId = `${uniqueId}-label`;
  const helperId = `${uniqueId}-helper`;
  const errorId = `${uniqueId}-error`;
  
  // Clean up file previews when component unmounts
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);
  
  // Handle file selection
  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    // Convert FileList to array
    const fileArray = Array.from(selectedFiles);
    
    // Check if adding these files would exceed the maximum
    if (multiple && maxFiles && files.length + fileArray.length > maxFiles) {
      const message = `You can only upload a maximum of ${maxFiles} files`;
      setAnnouncement(message);
      if (announceChanges) {
        announce(message, 'assertive');
      }
      return;
    }
    
    // Process files
    const processedFiles = fileArray.map(file => {
      // Check file size
      if (maxSize && file.size > maxSize) {
        const message = `File "${file.name}" exceeds the maximum size of ${formatFileSize(maxSize)}`;
        setAnnouncement(message);
        if (announceChanges) {
          announce(message, 'assertive');
        }
        return null;
      }
      
      // Create preview for images
      let preview: string | undefined;
      if (showPreviews && file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file);
      }
      
      return {
        ...file,
        preview,
        progress: 0,
        status: 'idle' as const,
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
    }).filter(Boolean) as FileWithPreview[];
    
    // Update files state
    if (multiple) {
      setFiles(prev => [...prev, ...processedFiles]);
    } else {
      // Clean up previous file previews
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
      
      setFiles(processedFiles.slice(0, 1));
    }
    
    // Call onFilesSelected callback
    if (onFilesSelected && processedFiles.length > 0) {
      onFilesSelected(processedFiles);
    }
    
    // Announce file selection
    const message = multiple
      ? `${processedFiles.length} ${processedFiles.length === 1 ? 'file' : 'files'} selected`
      : processedFiles.length > 0
        ? `File "${processedFiles[0].name}" selected`
        : 'No files selected';
    
    setAnnouncement(message);
    if (announceChanges) {
      announce(message);
    }
    
    // Auto upload if enabled
    if (autoUpload && processedFiles.length > 0) {
      processedFiles.forEach(simulateFileUpload);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };
  
  // Handle file removal
  const handleRemoveFile = (fileToRemove: FileWithPreview) => {
    // Clean up preview URL
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    
    // Update files state
    setFiles(prev => prev.filter(file => file.id !== fileToRemove.id));
    
    // Call onFileRemoved callback
    if (onFileRemoved) {
      onFileRemoved(fileToRemove);
    }
    
    // Announce file removal
    const message = `File "${fileToRemove.name}" removed`;
    setAnnouncement(message);
    if (announceChanges) {
      announce(message);
    }
  };
  
  // Handle clear all files
  const handleClearAll = () => {
    // Clean up preview URLs
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    
    // Update files state
    setFiles([]);
    
    // Call onAllFilesRemoved callback
    if (onAllFilesRemoved) {
      onAllFilesRemoved();
    }
    
    // Announce all files removed
    const message = 'All files removed';
    setAnnouncement(message);
    if (announceChanges) {
      announce(message);
    }
  };
  
  // Handle drag events
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    setIsDragging(true);
    
    // Announce drag enter
    const message = 'Files detected. Drop to upload.';
    setAnnouncement(message);
    if (announceChanges) {
      announce(message);
    }
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    // Only set isDragging to false if leaving the drop zone
    if (e.currentTarget === dropZoneRef.current) {
      setIsDragging(false);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    setIsDragging(true);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };
  
  // Simulate file upload (for demo purposes)
  const simulateFileUpload = (file: FileWithPreview) => {
    // Update file status to uploading
    setFiles(prev => 
      prev.map(f => 
        f.id === file.id 
          ? { ...f, status: 'uploading' as const, progress: 0 } 
          : f
      )
    );
    
    // Call onUploadStart callback
    if (onUploadStart) {
      onUploadStart(file);
    }
    
    // Announce upload start
    const startMessage = `Uploading file "${file.name}"`;
    setAnnouncement(startMessage);
    if (announceChanges) {
      announce(startMessage);
    }
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      
      // Update file progress
      setFiles(prev => 
        prev.map(f => 
          f.id === file.id 
            ? { ...f, progress } 
            : f
        )
      );
      
      // Call onUploadProgress callback
      if (onUploadProgress) {
        onUploadProgress(file, progress);
      }
      
      // Announce progress at 50%
      if (progress === 50) {
        const progressMessage = `File "${file.name}" is 50% uploaded`;
        setAnnouncement(progressMessage);
        if (announceChanges) {
          announce(progressMessage);
        }
      }
      
      if (progress >= 100) {
        clearInterval(interval);
        
        // Simulate success or error (90% success rate)
        const isSuccess = Math.random() > 0.1;
        
        if (isSuccess) {
          // Update file status to success
          setFiles(prev => 
            prev.map(f => 
              f.id === file.id 
                ? { ...f, status: 'success' as const } 
                : f
            )
          );
          
          // Call onUploadComplete callback
          if (onUploadComplete) {
            onUploadComplete(file);
          }
          
          // Announce upload complete
          const successMessage = `File "${file.name}" uploaded successfully`;
          setAnnouncement(successMessage);
          if (announceChanges) {
            announce(successMessage);
          }
        } else {
          // Update file status to error
          const errorMessage = 'Upload failed. Please try again.';
          setFiles(prev => 
            prev.map(f => 
              f.id === file.id 
                ? { ...f, status: 'error' as const, error: errorMessage } 
                : f
            )
          );
          
          // Call onUploadError callback
          if (onUploadError) {
            onUploadError(file, errorMessage);
          }
          
          // Announce upload error
          const errorAnnouncement = `Error uploading file "${file.name}": ${errorMessage}`;
          setAnnouncement(errorAnnouncement);
          if (announceChanges) {
            announce(errorAnnouncement, 'assertive');
          }
        }
      }
    }, reducedMotion ? 100 : 300);
  };
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Get file icon based on file type
  const getFileIcon = (file: FileWithPreview) => {
    if (file.type.startsWith('image/') && file.preview) {
      return (
        <img
          src={file.preview}
          alt={`Preview of ${file.name}`}
          className="h-10 w-10 object-cover rounded"
          onLoad={() => {
            // Revoke the data URI after the image is loaded to save memory
            URL.revokeObjectURL(file.preview!);
          }}
        />
      );
    }
    
    return <File className="h-10 w-10 text-muted-foreground" />;
  };
  
  // Get status icon based on file status
  const getStatusIcon = (file: FileWithPreview) => {
    switch (file.status) {
      case 'uploading':
        return null; // No icon during upload, show progress instead
      case 'success':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return null;
    }
  };
  
  return (
    <div className={cn('space-y-2', className)}>
      {/* Label */}
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
      
      {/* Drop zone */}
      <div
        ref={dropZoneRef}
        className={cn(
          'border-2 border-dashed rounded-md p-6 transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/20',
          disabled && 'opacity-50 cursor-not-allowed',
          error && 'border-destructive'
        )}
        onDragEnter={dragAndDrop ? handleDragEnter : undefined}
        onDragOver={dragAndDrop ? handleDragOver : undefined}
        onDragLeave={dragAndDrop ? handleDragLeave : undefined}
        onDrop={dragAndDrop ? handleDrop : undefined}
        aria-labelledby={labelId}
        aria-describedby={
          [
            helperText && helperId,
            error && errorId,
          ].filter(Boolean).join(' ') || undefined
        }
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Icon and text */}
          <div className="flex flex-col items-center justify-center text-center">
            <Upload
              className={cn(
                'h-10 w-10 mb-2',
                isDragging ? 'text-primary' : 'text-muted-foreground'
              )}
              aria-hidden="true"
            />
            <div className="text-sm text-muted-foreground">
              {isDragging ? (
                <p>{dropText}</p>
              ) : (
                <p>
                  <span className="font-medium text-foreground">Click to upload</span> or drag and drop
                </p>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {accept && `Accepted file types: ${accept}`}
              {maxSize && ` • Max size: ${formatFileSize(maxSize)}`}
              {maxFiles && multiple && ` • Max files: ${maxFiles}`}
            </p>
          </div>
          
          {/* File input */}
          <input
            ref={fileInputRef}
            id={uniqueId}
            type="file"
            className="sr-only"
            onChange={handleInputChange}
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            aria-required={required}
            aria-invalid={!!error}
          />
          
          {/* Upload button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            {uploadButtonLabel}
          </Button>
        </div>
      </div>
      
      {/* Helper text */}
      {helperText && (
        <p id={helperId} className="text-sm text-muted-foreground">
          {helperText}
        </p>
      )}
      
      {/* Error message */}
      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
      
      {/* File list */}
      {files.length > 0 && (
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              {files.length} {files.length === 1 ? 'file' : 'files'} selected
            </h3>
            
            {/* Clear all button */}
            {files.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                disabled={disabled}
                aria-label={clearAllButtonLabel}
              >
                {clearAllButtonLabel}
              </Button>
            )}
          </div>
          
          <ul className="space-y-2" aria-label="Selected files">
            {files.map(file => (
              <li
                key={file.id}
                className="flex items-center justify-between p-3 border rounded-md"
              >
                <div className="flex items-center space-x-3">
                  {/* File icon or preview */}
                  {getFileIcon(file)}
                  
                  <div className="space-y-1 overflow-hidden">
                    {/* File name */}
                    <p className="text-sm font-medium truncate max-w-[200px]">
                      {file.name}
                    </p>
                    
                    {/* File size */}
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                    
                    {/* Error message */}
                    {file.status === 'error' && file.error && (
                      <p className="text-xs text-destructive">
                        {file.error}
                      </p>
                    )}
                    
                    {/* Upload progress */}
                    {file.status === 'uploading' && (
                      <div className="w-full max-w-[200px]">
                        <Progress
                          value={file.progress}
                          className="h-1"
                          aria-label={`Upload progress for ${file.name}: ${file.progress}%`}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {file.progress}% uploaded
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Status icon */}
                  {getStatusIcon(file)}
                  
                  {/* Remove button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveFile(file)}
                    disabled={disabled || file.status === 'uploading'}
                    aria-label={`${removeButtonLabel} ${file.name}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* No files message */}
      {files.length === 0 && (
        <p className="text-sm text-muted-foreground mt-2">
          {noFilesText}
        </p>
      )}
      
      {/* Live region for announcements */}
      <LiveRegion politeness="polite" clearAfter={3000}>
        {announcement}
      </LiveRegion>
    </div>
  );
};

export default AccessibleFileUpload;
