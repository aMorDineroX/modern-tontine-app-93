/**
 * Debounce function to limit how often a function can be called
 * 
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns A debounced version of the function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
}

/**
 * Format a date to a string
 * 
 * @param date - The date to format
 * @param format - The format to use (default: 'yyyy-MM-dd')
 * @returns The formatted date string
 */
export function formatDate(date: Date, format: string = 'yyyy-MM-dd'): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return format
    .replace('yyyy', year.toString())
    .replace('MM', month)
    .replace('dd', day);
}

/**
 * Check if an object is empty
 * 
 * @param obj - The object to check
 * @returns True if the object is empty, false otherwise
 */
export function isEmptyObject(obj: Record<string, any>): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Generate a random ID
 * 
 * @param length - The length of the ID (default: 8)
 * @returns A random ID string
 */
export function generateId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Truncate a string to a specified length
 * 
 * @param str - The string to truncate
 * @param maxLength - The maximum length of the string
 * @param suffix - The suffix to add to the truncated string (default: '...')
 * @returns The truncated string
 */
export function truncateString(str: string, maxLength: number, suffix: string = '...'): string {
  if (str.length <= maxLength) {
    return str;
  }
  
  return str.substring(0, maxLength) + suffix;
}

/**
 * Group an array of objects by a key
 * 
 * @param array - The array to group
 * @param key - The key to group by
 * @returns An object with keys as the grouped values and values as arrays of objects
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    result[groupKey] = result[groupKey] || [];
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Calculate the percentage of a value relative to a total
 * 
 * @param value - The value
 * @param total - The total
 * @param decimals - The number of decimal places (default: 0)
 * @returns The percentage
 */
export function calculatePercentage(value: number, total: number, decimals: number = 0): number {
  if (total === 0) return 0;
  const percentage = (value / total) * 100;
  return Number(percentage.toFixed(decimals));
}
