'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Eye, Edit, Trash2, Clock } from 'lucide-react';
import { DataTableColumnHeader } from '@/components/ui/data-table';

export interface Test {
  id: string;
  title: string;
  description?: string;
  testType: 'mock-test' | 'sectional' | 'practice';
  totalQuestions: number;
  totalMarks: number;
  duration: number;
  isPublished: boolean;
  isFree: boolean;
  questionCount: number;
  createdAt: string;
  scheduledAt?: string;
}

const getTestTypeBadge = (type: string) => {
  const variants = {
    mock: { variant: 'default' as const, label: 'Mock Test' },
    live: { variant: 'destructive' as const, label: 'Live Test' },
    sectional: { variant: 'secondary' as const, label: 'Sectional' },
    practice: { variant: 'outline' as const, label: 'Practice' },
  };

  const { variant, label } = variants[type as keyof typeof variants] || variants.mock;
  return <Badge variant={variant}>{label}</Badge>;
};

export const createTestColumns = (
  onView: (test: Test) => void,
  onEdit: (test: Test) => void,
  onDelete: (id: string) => void,
  onTogglePublish: (testId: string, currentStatus: boolean) => void,
  onToggleFree: (testId: string, currentStatus: boolean) => void
): ColumnDef<Test>[] => [
  {
    accessorKey: 'title',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
    cell: ({ row }) => {
      const test = row.original;
      return (
        <div className="min-w-[200px]">
          <p className="font-medium">{test.title}</p>
          {test.description && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {test.description}
            </p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'testType',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
    cell: ({ row }) => getTestTypeBadge(row.getValue('testType')),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'questionCount',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Questions" />,
    cell: ({ row }) => {
      const test = row.original;
      return (
        <div className="flex flex-col">
          <span>{test.questionCount}</span>
          {test.questionCount !== test.totalQuestions && (
            <span className="text-xs text-amber-600">
              (Target: {test.totalQuestions})
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'duration',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Duration" />,
    cell: ({ row }) => {
      const duration = row.getValue('duration') as number;
      return (
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {duration} min
        </div>
      );
    },
  },
  {
    accessorKey: 'totalMarks',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Marks" />,
    cell: ({ row }) => {
      return <div>{row.getValue('totalMarks')}</div>;
    },
  },
  {
    accessorKey: 'isPublished',
    header: 'Status',
    cell: ({ row }) => {
      const test = row.original;
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Switch
              checked={test.isPublished}
              onCheckedChange={() => onTogglePublish(test.id, test.isPublished)}
            />
            <Badge
              variant={test.isPublished ? 'default' : 'secondary'}
              className="text-xs"
            >
              {test.isPublished ? 'Published' : 'Draft'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={test.isFree}
              onCheckedChange={() => onToggleFree(test.id, test.isFree)}
            />
            <Badge
              variant={test.isFree ? 'default' : 'outline'}
              className="text-xs"
            >
              {test.isFree ? 'Free' : 'Premium'}
            </Badge>
          </div>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const isPublished = row.getValue(id) as boolean;
      if (value === 'true') return isPublished === true;
      if (value === 'false') return isPublished === false;
      return true;
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
      return <div>{date.toLocaleDateString()}</div>;
    },
  },
  {
    id: 'actions',
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const test = row.original;
      return (
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onView(test)}
            title="View Questions"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(test)}
            title="Edit Test"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(test.id)}
            title="Delete Test"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
