import React, { useState, useEffect, useRef } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  X 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { LiveRegion } from './LiveRegion';

export interface Column<T> {
  /** Unique identifier for the column */
  id: string;
  /** Header text for the column */
  header: string;
  /** Function to get the cell value */
  accessor: (row: T) => React.ReactNode;
  /** Whether the column is sortable */
  sortable?: boolean;
  /** Whether the column is searchable */
  searchable?: boolean;
  /** Custom cell renderer */
  cell?: (value: any, row: T) => React.ReactNode;
  /** Width of the column */
  width?: string;
  /** Whether the column is visible */
  visible?: boolean;
  /** Additional CSS classes for the column */
  className?: string;
}

interface AccessibleDataTableProps<T> {
  /** Data to display in the table */
  data: T[];
  /** Column definitions */
  columns: Column<T>[];
  /** Caption for the table */
  caption?: string;
  /** Whether to enable pagination */
  pagination?: boolean;
  /** Number of rows per page */
  pageSize?: number;
  /** Whether to enable sorting */
  sortable?: boolean;
  /** Whether to enable searching */
  searchable?: boolean;
  /** Whether to enable row selection */
  selectable?: boolean;
  /** Function to call when rows are selected */
  onRowsSelected?: (rows: T[]) => void;
  /** Whether to enable keyboard navigation */
  keyboardNavigation?: boolean;
  /** Additional CSS classes for the table */
  className?: string;
  /** ID for the table */
  id?: string;
  /** Whether to announce table changes to screen readers */
  announceChanges?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Whether to enable sticky header */
  stickyHeader?: boolean;
  /** Whether to enable row hover effect */
  rowHover?: boolean;
  /** Function to get a unique key for each row */
  getRowKey?: (row: T) => string | number;
  /** Function to call when a row is clicked */
  onRowClick?: (row: T) => void;
}

/**
 * AccessibleDataTable component with enhanced accessibility features
 * 
 * @component
 * @example
 * <AccessibleDataTable
 *   data={users}
 *   columns={[
 *     { id: 'name', header: 'Name', accessor: (row) => row.name },
 *     { id: 'email', header: 'Email', accessor: (row) => row.email },
 *   ]}
 *   caption="Users Table"
 *   pagination
 *   pageSize={10}
 *   sortable
 *   searchable
 * />
 */
function AccessibleDataTable<T>({
  data,
  columns,
  caption,
  pagination = false,
  pageSize = 10,
  sortable = false,
  searchable = false,
  selectable = false,
  onRowsSelected,
  keyboardNavigation = true,
  className = '',
  id,
  announceChanges = true,
  loading = false,
  error,
  emptyMessage = 'No data available.',
  stickyHeader = false,
  rowHover = true,
  getRowKey = (row: T, index: number) => index,
  onRowClick,
}: AccessibleDataTableProps<T>) {
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  
  // State for sorting
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // State for searching
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for selection
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // State for keyboard navigation
  const [focusedCell, setFocusedCell] = useState<{ rowIndex: number; colIndex: number } | null>(null);
  
  // State for announcements
  const [announcement, setAnnouncement] = useState<string>('');
  
  // Refs
  const tableRef = useRef<HTMLTableElement>(null);
  const cellRefs = useRef<Map<string, HTMLTableCellElement>>(new Map());
  
  // Accessibility context
  const { announce } = useAccessibility();
  
  // Generate a unique ID for the table
  const uniqueId = id || `table-${React.useId()}`;
  const captionId = `${uniqueId}-caption`;
  const searchId = `${uniqueId}-search`;
  
  // Filter and sort data
  const filteredData = React.useMemo(() => {
    let result = [...data];
    
    // Apply search filter
    if (searchQuery) {
      const searchableColumns = columns.filter(col => col.searchable !== false);
      result = result.filter(row => 
        searchableColumns.some(col => {
          const value = col.accessor(row);
          return value !== null && 
            value !== undefined && 
            String(value).toLowerCase().includes(searchQuery.toLowerCase());
        })
      );
    }
    
    // Apply sorting
    if (sortColumn) {
      const column = columns.find(col => col.id === sortColumn);
      if (column) {
        result.sort((a, b) => {
          const valueA = column.accessor(a);
          const valueB = column.accessor(b);
          
          if (valueA === valueB) return 0;
          
          const comparison = valueA < valueB ? -1 : 1;
          return sortDirection === 'asc' ? comparison : -comparison;
        });
      }
    }
    
    return result;
  }, [data, columns, searchQuery, sortColumn, sortDirection]);
  
  // Paginate data
  const paginatedData = React.useMemo(() => {
    if (!pagination) return filteredData;
    
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, pagination, currentPage, rowsPerPage]);
  
  // Total pages
  const totalPages = React.useMemo(() => {
    if (!pagination) return 1;
    return Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  }, [filteredData.length, pagination, rowsPerPage]);
  
  // Visible columns
  const visibleColumns = React.useMemo(() => {
    return columns.filter(col => col.visible !== false);
  }, [columns]);
  
  // Update selected rows when data changes
  useEffect(() => {
    if (selectable) {
      setSelectedRows([]);
      setSelectAll(false);
    }
  }, [data, selectable]);
  
  // Notify parent component of selected rows
  useEffect(() => {
    if (selectable && onRowsSelected) {
      onRowsSelected(selectedRows);
    }
  }, [selectedRows, selectable, onRowsSelected]);
  
  // Handle sort
  const handleSort = (columnId: string) => {
    if (!sortable) return;
    
    const column = columns.find(col => col.id === columnId);
    if (!column || column.sortable === false) return;
    
    if (sortColumn === columnId) {
      // Toggle direction
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newDirection);
      
      // Announce sort change
      const message = `Sorted by ${column.header} ${newDirection === 'asc' ? 'ascending' : 'descending'}`;
      setAnnouncement(message);
      if (announceChanges) {
        announce(message);
      }
    } else {
      // Set new sort column
      setSortColumn(columnId);
      setSortDirection('asc');
      
      // Announce sort change
      const message = `Sorted by ${column.header} ascending`;
      setAnnouncement(message);
      if (announceChanges) {
        announce(message);
      }
    }
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    
    setCurrentPage(page);
    
    // Announce page change
    const message = `Page ${page} of ${totalPages}`;
    setAnnouncement(message);
    if (announceChanges) {
      announce(message);
    }
    
    // Reset focused cell
    setFocusedCell(null);
  };
  
  // Handle rows per page change
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    setRowsPerPage(value);
    setCurrentPage(1);
    
    // Announce rows per page change
    const message = `Showing ${value} rows per page`;
    setAnnouncement(message);
    if (announceChanges) {
      announce(message);
    }
  };
  
  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setCurrentPage(1);
    
    // Announce search results after a short delay
    setTimeout(() => {
      const filteredCount = filteredData.length;
      const message = value
        ? `Found ${filteredCount} ${filteredCount === 1 ? 'result' : 'results'} for "${value}"`
        : `Search cleared, showing all ${data.length} rows`;
      
      setAnnouncement(message);
      if (announceChanges) {
        announce(message);
      }
    }, 500);
  };
  
  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
    
    // Announce search cleared
    const message = `Search cleared, showing all ${data.length} rows`;
    setAnnouncement(message);
    if (announceChanges) {
      announce(message);
    }
  };
  
  // Handle row selection
  const handleRowSelect = (row: T, isSelected: boolean) => {
    if (!selectable) return;
    
    if (isSelected) {
      setSelectedRows(prev => [...prev, row]);
    } else {
      setSelectedRows(prev => prev.filter(r => r !== row));
    }
  };
  
  // Handle select all
  const handleSelectAll = (isSelected: boolean) => {
    if (!selectable) return;
    
    setSelectAll(isSelected);
    setSelectedRows(isSelected ? paginatedData : []);
    
    // Announce select all
    const message = isSelected
      ? `Selected all ${paginatedData.length} rows`
      : 'Deselected all rows';
    
    setAnnouncement(message);
    if (announceChanges) {
      announce(message);
    }
  };
  
  // Check if a row is selected
  const isRowSelected = (row: T) => {
    return selectedRows.includes(row);
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTableElement>) => {
    if (!keyboardNavigation || !focusedCell) return;
    
    const { rowIndex, colIndex } = focusedCell;
    const rows = paginatedData.length;
    const cols = visibleColumns.length;
    
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (rowIndex > 0) {
          setFocusedCell({ rowIndex: rowIndex - 1, colIndex });
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (rowIndex < rows - 1) {
          setFocusedCell({ rowIndex: rowIndex + 1, colIndex });
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (colIndex > 0) {
          setFocusedCell({ rowIndex, colIndex: colIndex - 1 });
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (colIndex < cols - 1) {
          setFocusedCell({ rowIndex, colIndex: colIndex + 1 });
        }
        break;
      case 'Home':
        e.preventDefault();
        if (e.ctrlKey) {
          // Go to first cell of first row
          setFocusedCell({ rowIndex: 0, colIndex: 0 });
        } else {
          // Go to first cell of current row
          setFocusedCell({ rowIndex, colIndex: 0 });
        }
        break;
      case 'End':
        e.preventDefault();
        if (e.ctrlKey) {
          // Go to last cell of last row
          setFocusedCell({ rowIndex: rows - 1, colIndex: cols - 1 });
        } else {
          // Go to last cell of current row
          setFocusedCell({ rowIndex, colIndex: cols - 1 });
        }
        break;
      case 'PageUp':
        e.preventDefault();
        if (pagination && currentPage > 1) {
          handlePageChange(currentPage - 1);
        }
        break;
      case 'PageDown':
        e.preventDefault();
        if (pagination && currentPage < totalPages) {
          handlePageChange(currentPage + 1);
        }
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (onRowClick) {
          onRowClick(paginatedData[rowIndex]);
        }
        break;
    }
  };
  
  // Focus cell when focusedCell changes
  useEffect(() => {
    if (!focusedCell) return;
    
    const { rowIndex, colIndex } = focusedCell;
    const cellKey = `${rowIndex}-${colIndex}`;
    const cell = cellRefs.current.get(cellKey);
    
    if (cell) {
      cell.focus();
      
      // Announce focused cell
      const row = paginatedData[rowIndex];
      const column = visibleColumns[colIndex];
      if (row && column) {
        const cellValue = column.accessor(row);
        const message = `${column.header}: ${cellValue}`;
        setAnnouncement(message);
        if (announceChanges) {
          announce(message);
        }
      }
    }
  }, [focusedCell, paginatedData, visibleColumns, announce, announceChanges]);
  
  // Register cell ref
  const registerCellRef = (rowIndex: number, colIndex: number, ref: HTMLTableCellElement | null) => {
    if (ref) {
      cellRefs.current.set(`${rowIndex}-${colIndex}`, ref);
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="text-destructive p-4 border border-destructive/20 rounded-md">
        <p className="font-medium">Error loading data</p>
        <p>{error}</p>
      </div>
    );
  }
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Table controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        {/* Search */}
        {searchable && (
          <div className="relative w-full sm:w-64">
            <label htmlFor={searchId} className="sr-only">Search</label>
            <Input
              id={searchId}
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-9 pr-9"
              aria-controls={uniqueId}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                onClick={handleClearSearch}
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
        
        {/* Pagination controls */}
        {pagination && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-muted-foreground">
              Rows per page:
            </span>
            <select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              className="h-8 w-16 rounded-md border border-input bg-background px-2 text-sm"
              aria-label="Rows per page"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}
      </div>
      
      {/* Table */}
      <div className="relative overflow-x-auto rounded-md border">
        <Table
          ref={tableRef}
          id={uniqueId}
          aria-labelledby={caption ? captionId : undefined}
          aria-rowcount={filteredData.length + 1} // +1 for header row
          aria-colcount={visibleColumns.length}
          aria-busy={loading}
          onKeyDown={handleKeyDown}
          className={cn(
            stickyHeader && 'relative [&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10 [&_thead]:bg-background'
          )}
        >
          {caption && (
            <caption id={captionId} className="sr-only">
              {caption}
            </caption>
          )}
          
          <TableHeader>
            <TableRow>
              {/* Selection checkbox column */}
              {selectable && (
                <TableHead className="w-10">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      aria-label={selectAll ? 'Deselect all rows' : 'Select all rows'}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                  </div>
                </TableHead>
              )}
              
              {/* Data columns */}
              {visibleColumns.map((column, colIndex) => (
                <TableHead
                  key={column.id}
                  className={cn(
                    column.width && column.width,
                    column.className,
                    sortable && column.sortable !== false && 'cursor-pointer select-none'
                  )}
                  onClick={() => sortable && column.sortable !== false && handleSort(column.id)}
                  aria-sort={
                    sortColumn === column.id
                      ? sortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                  style={{ width: column.width }}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {sortable && column.sortable !== false && (
                      <div className="ml-1">
                        {sortColumn === column.id ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <ArrowDown className="h-4 w-4" aria-hidden="true" />
                          )
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-50" aria-hidden="true" />
                        )}
                      </div>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length + (selectable ? 1 : 0)}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, rowIndex) => {
                const rowKey = typeof getRowKey === 'function' 
                  ? getRowKey(row, rowIndex) 
                  : rowIndex;
                
                return (
                  <TableRow
                    key={rowKey}
                    className={cn(
                      rowHover && 'hover:bg-muted/50',
                      isRowSelected(row) && 'bg-muted',
                      onRowClick && 'cursor-pointer'
                    )}
                    onClick={() => onRowClick && onRowClick(row)}
                    aria-selected={isRowSelected(row)}
                    aria-rowindex={rowIndex + 2} // +2 because 1-based and header row
                  >
                    {/* Selection checkbox */}
                    {selectable && (
                      <TableCell className="w-10">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={isRowSelected(row)}
                            onChange={(e) => handleRowSelect(row, e.target.checked)}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Select row ${rowIndex + 1}`}
                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                          />
                        </div>
                      </TableCell>
                    )}
                    
                    {/* Data cells */}
                    {visibleColumns.map((column, colIndex) => {
                      const value = column.accessor(row);
                      const cellContent = column.cell 
                        ? column.cell(value, row) 
                        : value;
                      
                      return (
                        <TableCell
                          key={column.id}
                          ref={(ref) => registerCellRef(rowIndex, colIndex, ref)}
                          className={cn(
                            column.className,
                            focusedCell?.rowIndex === rowIndex && 
                            focusedCell?.colIndex === colIndex && 
                            'outline outline-2 outline-primary'
                          )}
                          tabIndex={
                            keyboardNavigation && 
                            focusedCell?.rowIndex === rowIndex && 
                            focusedCell?.colIndex === colIndex
                              ? 0
                              : -1
                          }
                          aria-colindex={colIndex + 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            setFocusedCell({ rowIndex, colIndex });
                            if (onRowClick) {
                              onRowClick(row);
                            }
                          }}
                        >
                          {cellContent}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length} entries
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              aria-label="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="text-sm">
              Page {currentPage} of {totalPages}
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              aria-label="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Live region for announcements */}
      <LiveRegion politeness="polite" clearAfter={3000}>
        {announcement}
      </LiveRegion>
    </div>
  );
}

export default AccessibleDataTable;
