import * as React from "react"

/**
 * Custom hook that returns a boolean indicating if the media query matches
 * 
 * @param query The media query to check
 * @returns A boolean indicating if the media query matches
 * 
 * @example
 * const isMobile = useMediaQuery("(max-width: 768px)")
 * const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)")
 * const isDarkMode = useMediaQuery("(prefers-color-scheme: dark)")
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Create media query list
    const mediaQueryList = window.matchMedia(query)
    
    // Set initial value
    setMatches(mediaQueryList.matches)
    
    // Define event listener
    const onChange = () => {
      setMatches(mediaQueryList.matches)
    }
    
    // Add event listener
    mediaQueryList.addEventListener("change", onChange)
    
    // Clean up
    return () => mediaQueryList.removeEventListener("change", onChange)
  }, [query])

  return matches
}
