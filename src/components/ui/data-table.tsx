'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  PaginationState,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown, Settings2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  // Pagination
  pageCount?: number;
  pageSize?: number;
  pageIndex?: number;
  totalItems?: number;
  onPaginationChange?: (pagination: PaginationState) => void;
  manualPagination?: boolean;
  // Sorting
  onSortingChange?: (sorting: SortingState) => void;
  manualSorting?: boolean;
  // Storage key for persisting state
  storageKey?: string;
  // Search/Filter bar
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  // Custom toolbar
  toolbar?: React.ReactNode;
  // Row selection
  enableRowSelection?: boolean;
  onRowSelectionChange?: (selectedRows: TData[]) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  pageCount: controlledPageCount,
  pageSize: controlledPageSize = 10,
  pageIndex: controlledPageIndex = 0,
  totalItems,
  onPaginationChange,
  manualPagination = false,
  onSortingChange,
  manualSorting = false,
  storageKey,
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  toolbar,
  enableRowSelection = false,
  onRowSelectionChange,
}: DataTableProps<TData, TValue>) {
  // Load initial state from localStorage
  const getInitialState = () => {
    if (!storageKey || typeof window === 'undefined') {
      return {
        sorting: [],
        columnVisibility: {},
        columnFilters: [],
        rowSelection: {},
      };
    }

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          sorting: parsed.sorting || [],
          columnVisibility: parsed.columnVisibility || {},
          columnFilters: parsed.columnFilters || [],
          rowSelection: {},
        };
      }
    } catch (error) {
      console.error('Error loading table state:', error);
    }

    return {
      sorting: [],
      columnVisibility: {},
      columnFilters: [],
      rowSelection: {},
    };
  };

  const initialState = getInitialState();

  const [sorting, setSorting] = React.useState<SortingState>(initialState.sorting);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    initialState.columnFilters
  );
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(
    initialState.columnVisibility
  );
  const [rowSelection, setRowSelection] = React.useState(initialState.rowSelection);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: controlledPageIndex,
    pageSize: controlledPageSize,
  });

  // Save state to localStorage
  React.useEffect(() => {
    if (storageKey && typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            sorting,
            columnVisibility,
            columnFilters,
          })
        );
      } catch (error) {
        console.error('Error saving table state:', error);
      }
    }
  }, [sorting, columnVisibility, columnFilters, storageKey]);

  // Sync controlled pagination
  React.useEffect(() => {
    if (manualPagination) {
      setPagination({
        pageIndex: controlledPageIndex,
        pageSize: controlledPageSize,
      });
    }
  }, [controlledPageIndex, controlledPageSize, manualPagination]);

  const table = useReactTable({
    data,
    columns,
    pageCount: controlledPageCount ?? -1,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    enableRowSelection,
    onRowSelectionChange: setRowSelection,
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(newSorting);
      if (onSortingChange) {
        onSortingChange(newSorting);
      }
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
      setPagination(newPagination);
      if (onPaginationChange) {
        onPaginationChange(newPagination);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    ...(manualPagination ? {} : { getPaginationRowModel: getPaginationRowModel() }),
    ...(manualSorting ? {} : { getSortedRowModel: getSortedRowModel() }),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination,
    manualSorting,
  });

  // Notify parent of row selection changes
  React.useEffect(() => {
    if (onRowSelectionChange && enableRowSelection) {
      const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original);
      onRowSelectionChange(selectedRows);
    }
  }, [rowSelection, enableRowSelection, onRowSelectionChange, table]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          {onSearchChange && (
            <input
              placeholder={searchPlaceholder}
              value={searchValue || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-10 w-[250px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          )}
          {toolbar}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <Settings2 className="mr-2 h-4 w-4" />
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              // Skeleton rows
              Array.from({ length: pagination.pageSize }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {enableRowSelection && (
            <span>
              {table.getFilteredSelectedRowModel().rows.length} of{' '}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </span>
          )}
          {totalItems !== undefined && (
            <span className="ml-2">
              Showing {pagination.pageIndex * pagination.pageSize + 1} to{' '}
              {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalItems)} of{' '}
              {totalItems} results
            </span>
          )}
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {pagination.pageIndex + 1} of{' '}
            {manualPagination ? controlledPageCount : table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for sortable column headers
export function DataTableColumnHeader({
  column,
  title,
}: {
  column: any;
  title: string;
}) {
  if (!column.getCanSort()) {
    return <div>{title}</div>;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 data-[state=open]:bg-accent"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      <span>{title}</span>
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}
