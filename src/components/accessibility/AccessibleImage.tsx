import React, { useState } from 'react';

interface AccessibleImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Alternative text for the image */
  alt: string;
  /** Long description of the image */
  longDescription?: string;
  /** Whether the image is decorative */
  decorative?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Fallback image URL */
  fallbackSrc?: string;
  /** Whether to show a loading indicator */
  showLoading?: boolean;
  /** Loading indicator component */
  loadingComponent?: React.ReactNode;
  /** Error component to show when image fails to load */
  errorComponent?: React.ReactNode;
}

/**
 * AccessibleImage component for making images accessible
 * 
 * @component
 * @example
 * <AccessibleImage
 *   src="/path/to/image.jpg"
 *   alt="A description of the image"
 *   longDescription="A more detailed description of the image content and context"
 * />
 */
const AccessibleImage: React.FC<AccessibleImageProps> = ({
  src,
  alt,
  longDescription,
  decorative = false,
  className = '',
  fallbackSrc,
  showLoading = false,
  loadingComponent,
  errorComponent,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  
  // Generate a unique ID for the long description
  const descriptionId = longDescription ? `img-desc-${React.useId()}` : undefined;
  
  // Handle image load
  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    
    if (props.onLoad) {
      props.onLoad({} as React.SyntheticEvent<HTMLImageElement>);
    }
  };
  
  // Handle image error
  const handleError = () => {
    setHasError(true);
    
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      setIsLoading(false);
    }
    
    if (props.onError) {
      props.onError({} as React.SyntheticEvent<HTMLImageElement>);
    }
  };
  
  // If the image is decorative, set alt to empty string and aria-hidden to true
  const imgProps = decorative
    ? {
        alt: '',
        'aria-hidden': 'true',
        role: 'presentation',
      }
    : {
        alt,
        ...(longDescription && { 'aria-describedby': descriptionId }),
      };
  
  return (
    <div className={`relative ${className}`}>
      {isLoading && showLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 animate-pulse">
          {loadingComponent || (
            <span className="sr-only">Loading image</span>
          )}
        </div>
      )}
      
      {hasError && !fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          {errorComponent || (
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center p-4">
              <span aria-hidden="true">⚠️</span> Image failed to load
              <span className="sr-only">Image failed to load: {alt}</span>
            </div>
          )}
        </div>
      )}
      
      <img
        src={currentSrc}
        className={`max-w-full h-auto ${isLoading ? 'invisible' : 'visible'}`}
        onLoad={handleLoad}
        onError={handleError}
        {...imgProps}
        {...props}
      />
      
      {longDescription && (
        <div id={descriptionId} className="sr-only">
          {longDescription}
        </div>
      )}
    </div>
  );
};

export default AccessibleImage;
