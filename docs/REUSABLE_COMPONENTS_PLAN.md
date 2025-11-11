# Reusable Components Plan

## Overview
Extract common patterns from Questions page into reusable components for Test Builder and other admin pages.

---

## 1. DataTable Component (`components/admin/data-table.tsx`)

**Purpose:** Generic server-side paginated table with actions

**Props:**
```typescript
interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  isLoading?: boolean
  pagination?: {
    currentPage: number
    totalPages: number
    total: number
    onPageChange: (page: number) => void
  }
  emptyState?: {
    icon?: React.ReactNode
    title: string
    description: string
  }
}
```

**Features:**
- Server-side pagination controls
- Loading skeleton
- Empty state
- Column definitions with custom renderers
- Responsive table wrapper with horizontal scroll

**Usage:**
```tsx
<DataTable
  columns={questionColumns}
  data={questions}
  isLoading={isLoading}
  pagination={{
    currentPage,
    totalPages,
    total,
    onPageChange: setCurrentPage
  }}
/>
```

---

## 2. FilterBar Component (`components/admin/filter-bar.tsx`)

**Purpose:** Reusable filter section with dropdowns

**Props:**
```typescript
interface Filter {
  key: string
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
  placeholder?: string
}

interface FilterBarProps {
  filters: Filter[]
  onClear?: () => void
}
```

**Features:**
- Multiple select dropdowns
- Clear all filters button
- Responsive grid layout
- Auto-width based on number of filters

**Usage:**
```tsx
<FilterBar
  filters={[
    {
      key: 'section',
      label: 'Section',
      value: filterSection,
      options: sections.map(s => ({ value: s.id, label: s.name })),
      onChange: setFilterSection,
      placeholder: 'All sections'
    }
  ]}
  onClear={clearFilters}
/>
```

---

## 3. DragDropList Component (`components/admin/drag-drop-list.tsx`)

**Purpose:** Sortable list with drag-and-drop using @dnd-kit

**Props:**
```typescript
interface DragDropItem {
  id: string
  [key: string]: any
}

interface DragDropListProps<T extends DragDropItem> {
  items: T[]
  onReorder: (items: T[]) => void
  renderItem: (item: T, index: number) => React.ReactNode
  disabled?: boolean
}
```

**Features:**
- Drag handles
- Visual feedback during drag
- Reorder animation
- Touch support
- Disabled state

**Usage:**
```tsx
<DragDropList
  items={testQuestions}
  onReorder={handleReorder}
  renderItem={(question, index) => (
    <div>
      <span>{index + 1}.</span>
      <span>{question.questionText}</span>
    </div>
  )}
/>
```

---

## 4. StatusTabs Component (`components/admin/status-tabs.tsx`)

**Purpose:** Reusable status filter tabs with counts

**Props:**
```typescript
interface StatusTab {
  value: string
  label: string
  count?: number
}

interface StatusTabsProps {
  tabs: StatusTab[]
  activeTab: string
  onChange: (value: string) => void
}
```

**Features:**
- Badge counts
- Active state styling
- Responsive layout

**Usage:**
```tsx
<StatusTabs
  tabs={[
    { value: 'all', label: 'All', count: 1462 },
    { value: 'pending', label: 'Pending', count: 120 },
    { value: 'approved', label: 'Approved', count: 1340 }
  ]}
  activeTab={activeTab}
  onChange={setActiveTab}
/>
```

---

## 5. FormSheet Component (`components/admin/form-sheet.tsx`)

**Purpose:** Reusable side sheet for create/edit forms

**Props:**
```typescript
interface FormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  onSubmit: (e: React.FormEvent) => void
  isSubmitting?: boolean
  submitLabel?: string
  cancelLabel?: string
}
```

**Features:**
- Slide-in from right
- Form wrapper with submit handler
- Loading state on submit button
- Cancel button
- Scrollable content area

---

## Implementation Order

1. **DataTable** - Most complex, used everywhere
2. **FilterBar** - Simple, immediate benefit
3. **StatusTabs** - Quick win, reusable pattern
4. **FormSheet** - Standardize form UX
5. **DragDropList** - For test builder specifically

---

## Test Builder UI Plan

After creating reusable components, build Test Builder with:

### Layout
```
┌─────────────────────────────────────────────────────────┐
│ Test Builder                                            │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Form Fields (Title, Type, Duration, etc.)           │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Question Picker Modal/Sheet                         │ │
│ │ - Filter by Section/Topic/Difficulty                │ │
│ │ - Search questions                                  │ │
│ │ - Only show approved questions                      │ │
│ │ - Multi-select with checkboxes                      │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Selected Questions (DragDropList)                   │ │
│ │ 1. [drag] Question text... [marks input] [remove]   │ │
│ │ 2. [drag] Question text... [marks input] [remove]   │ │
│ │ 3. [drag] Question text... [marks input] [remove]   │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Summary                                              │ │
│ │ Total Questions: 50 | Total Marks: 200              │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ [Save Draft] [Preview] [Publish Test]                   │
└─────────────────────────────────────────────────────────┘
```

### Components Needed
- `TestBuilderForm` - Main form with metadata
- `QuestionPickerSheet` - Modal to browse/select questions (uses DataTable + FilterBar)
- `SelectedQuestionsList` - DragDropList with marks input
- `TestSummaryCard` - Stats display

### API Calls
- GET `/api/admin/questions/approved` - For question picker
- POST `/api/admin/tests` - Create test
- POST `/api/admin/tests/[id]/questions` - Add questions with order
- PATCH `/api/admin/tests/[id]/questions` - Reorder questions

---

## Next Steps

1. Create DataTable component first
2. Create FilterBar component
3. Refactor Questions page to use new components
4. Build Test Builder using the components
5. Build Test List page
