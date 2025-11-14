# Reusable DataTable Component

## Overview
A comprehensive, reusable data table component built with TanStack Table (React Table v8) that provides sorting, pagination, filtering, column visibility controls, and skeleton loading states. Table state is persisted to localStorage.

## Features

### ✅ Implemented Features

1. **Sorting**
   - Client-side and server-side sorting support
   - Sortable column headers with visual indicators
   - Multi-column sorting capability
   - State persisted to localStorage

2. **Pagination**
   - Both client-side and server-side pagination
   - Customizable page size (10, 20, 30, 40, 50 rows)
   - Previous/Next navigation
   - Page indicator
   - Total items count display

3. **Loading States**
   - Skeleton rows during data fetch
   - Maintains table structure while loading
   - Configurable skeleton row count based on page size

4. **Column Visibility**
   - Toggle column visibility via dropdown menu
   - Settings icon in toolbar
   - State persisted to localStorage

5. **State Persistence**
   - Sorting preferences saved
   - Column visibility saved
   - Column filters saved
   - Uses localStorage with configurable storage key

6. **Row Selection** (Optional)
   - Enable/disable row selection
   - Callback for selected rows
   - Visual selection state

7. **Search/Filter**
   - Optional search input in toolbar
   - Controlled search value
   - Custom placeholder text

8. **Custom Toolbar**
   - Slot for custom toolbar content
   - Flexible positioning

## Installation

```bash
npm install @tanstack/react-table
```

## File Structure

```
src/
├── components/
│   └── ui/
│       ├── data-table.tsx          # Main DataTable component
│       └── skeleton.tsx             # Skeleton component
└── app/
    └── admin/
        └── questions/
            ├── page.tsx             # Example usage
            └── columns.tsx          # Column definitions
```

## Usage

### 1. Define Column Definitions

Create a separate file for your column definitions:

```tsx
// columns.tsx
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/data-table';

export interface YourDataType {
  id: string;
  name: string;
  status: string;
  // ... other fields
}

export const createColumns = (
  onView: (item: YourDataType) => void,
  onEdit: (item: YourDataType) => void,
  onDelete: (id: string) => void
): ColumnDef<YourDataType>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => <div>{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status');
      return <Badge>{status}</Badge>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex gap-2">
          <Button onClick={() => onView(item)}>View</Button>
          <Button onClick={() => onEdit(item)}>Edit</Button>
          <Button onClick={() => onDelete(item.id)}>Delete</Button>
        </div>
      );
    },
  },
];
```

### 2. Use DataTable in Your Page

```tsx
// page.tsx
'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { createColumns, YourDataType } from './columns';

export default function YourPage() {
  const [data, setData] = useState<YourDataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/your-endpoint?page=${currentPage + 1}&limit=${pageSize}`
      );
      const result = await response.json();
      setData(result.data);
      setTotalItems(result.pagination.total);
      setPageCount(result.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize]);

  return (
    <div className="space-y-6">
      <h1>Your Page Title</h1>
      
      <DataTable
        columns={createColumns(
          handleView,
          handleEdit,
          handleDelete
        )}
        data={data}
        loading={loading}
        manualPagination
        pageCount={pageCount}
        pageSize={pageSize}
        pageIndex={currentPage}
        totalItems={totalItems}
        onPaginationChange={(pagination) => {
          setCurrentPage(pagination.pageIndex);
          setPageSize(pagination.pageSize);
        }}
        storageKey="your-table-state"
      />
    </div>
  );
}
```

## Props Reference

### DataTable Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `ColumnDef<TData, TValue>[]` | required | Column definitions |
| `data` | `TData[]` | required | Data array to display |
| `loading` | `boolean` | `false` | Show skeleton loading state |
| `pageCount` | `number` | - | Total number of pages (for manual pagination) |
| `pageSize` | `number` | `10` | Number of rows per page |
| `pageIndex` | `number` | `0` | Current page index (0-based) |
| `totalItems` | `number` | - | Total number of items |
| `onPaginationChange` | `(pagination: PaginationState) => void` | - | Callback when pagination changes |
| `manualPagination` | `boolean` | `false` | Enable server-side pagination |
| `onSortingChange` | `(sorting: SortingState) => void` | - | Callback when sorting changes |
| `manualSorting` | `boolean` | `false` | Enable server-side sorting |
| `storageKey` | `string` | - | Key for localStorage persistence |
| `searchPlaceholder` | `string` | `'Search...'` | Placeholder text for search input |
| `searchValue` | `string` | - | Controlled search value |
| `onSearchChange` | `(value: string) => void` | - | Callback when search changes |
| `toolbar` | `React.ReactNode` | - | Custom toolbar content |
| `enableRowSelection` | `boolean` | `false` | Enable row selection |
| `onRowSelectionChange` | `(selectedRows: TData[]) => void` | - | Callback for selected rows |

## Pagination Modes

### Client-Side Pagination

For small datasets that can be loaded entirely:

```tsx
<DataTable
  columns={columns}
  data={allData}
  loading={loading}
  pageSize={20}
  storageKey="my-table"
/>
```

### Server-Side Pagination

For large datasets with API pagination:

```tsx
<DataTable
  columns={columns}
  data={currentPageData}
  loading={loading}
  manualPagination
  pageCount={totalPages}
  pageSize={pageSize}
  pageIndex={currentPage}
  totalItems={totalItems}
  onPaginationChange={(pagination) => {
    setCurrentPage(pagination.pageIndex);
    setPageSize(pagination.pageSize);
  }}
  storageKey="my-table"
/>
```

## Sorting

### Client-Side Sorting

Automatic sorting on client data:

```tsx
<DataTable
  columns={columns}
  data={data}
  storageKey="my-table"
/>
```

### Server-Side Sorting

Pass sorting state to your API:

```tsx
<DataTable
  columns={columns}
  data={data}
  manualSorting
  onSortingChange={(sorting) => {
    // sorting is an array like: [{ id: 'name', desc: false }]
    fetchData(sorting);
  }}
  storageKey="my-table"
/>
```

## Storage Key

The `storageKey` prop enables state persistence:

```tsx
<DataTable
  storageKey="questions-table-state"
  // ... other props
/>
```

Stored state includes:
- Column sorting preferences
- Column visibility settings
- Column filters

## Helper Components

### DataTableColumnHeader

Provides sortable column headers:

```tsx
import { DataTableColumnHeader } from '@/components/ui/data-table';

{
  accessorKey: 'name',
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Name" />
  ),
}
```

## Example: Questions Page

See `/src/app/admin/questions/` for a complete implementation with:
- Server-side pagination
- Column definitions in separate file
- View/Edit/Delete actions
- Status filtering
- Difficulty filtering
- State persistence

## Customization

### Custom Cell Rendering

```tsx
{
  accessorKey: 'status',
  header: 'Status',
  cell: ({ row }) => {
    const status = row.getValue('status');
    return (
      <Badge variant={status === 'active' ? 'success' : 'secondary'}>
        {status}
      </Badge>
    );
  },
}
```

### Custom Header Rendering

```tsx
{
  accessorKey: 'name',
  header: () => <div className="font-bold">Custom Header</div>,
  cell: ({ row }) => row.getValue('name'),
}
```

### Accessor Functions

For computed values:

```tsx
{
  id: 'fullName',
  accessorFn: (row) => `${row.firstName} ${row.lastName}`,
  header: 'Full Name',
}
```

## Best Practices

1. **Separate Column Definitions**: Keep column definitions in a separate file for maintainability
2. **Use Storage Keys**: Always provide a unique `storageKey` for state persistence
3. **Handle Loading States**: Show loading state during data fetches
4. **Manual Pagination for Large Datasets**: Use server-side pagination for datasets > 1000 rows
5. **Type Safety**: Define proper TypeScript interfaces for your data
6. **Memoize Handlers**: Use `useCallback` for action handlers in column definitions

## Dependencies

- `@tanstack/react-table` - Table logic and state management
- `lucide-react` - Icons
- `@/components/ui/*` - shadcn/ui components
  - Button
  - Table
  - Skeleton
  - Select
  - DropdownMenu

## Future Enhancements

Potential additions:
- [ ] Global filter/search
- [ ] Export to CSV/Excel
- [ ] Bulk actions
- [ ] Resizable columns
- [ ] Column pinning
- [ ] Expandable rows
- [ ] Inline editing
- [ ] Custom empty states
- [ ] Loading skeletons per column type
