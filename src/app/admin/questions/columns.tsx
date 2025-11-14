'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { DataTableColumnHeader } from '@/components/ui/data-table';

export interface Question {
  id: string;
  questionText: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correctOption: number;
  explanation?: string;
  sectionId: string;
  topicId?: string;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  status: 'pending' | 'approved' | 'rejected';
  isVerified: boolean;
  isActive: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  creatorName?: string;
  verifierName?: string;
  hasEquation: boolean;
  imageUrl?: string;
  createdAt: string;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'hard':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'approved':
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Approved</Badge>;
    case 'rejected':
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Rejected</Badge>;
    case 'pending':
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Pending</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export const createQuestionColumns = (
  onView: (question: Question) => void,
  onEdit: (question: Question) => void,
  onDelete: (id: string) => void
): ColumnDef<Question>[] => [
  {
    accessorKey: 'questionText',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Question" />,
    cell: ({ row }) => {
      const question = row.original;
      return (
        <div className="min-w-[300px] max-w-[400px]">
          <div className="truncate font-medium" title={question.questionText}>
            {question.questionText}
          </div>
          {question.creatorName && (
            <div className="text-xs text-muted-foreground mt-1">
              By: {question.creatorName}
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: 'correctAnswer',
    accessorFn: (row) => row[`option${row.correctOption}` as keyof Question],
    header: 'Correct Answer',
    cell: ({ row }) => {
      const correctAnswer = row.original[`option${row.original.correctOption}` as keyof Question];
      return (
        <div className="w-[180px]">
          <div className="max-w-[160px] truncate" title={correctAnswer as string}>
            {correctAnswer as string}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'difficultyLevel',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Difficulty" />,
    cell: ({ row }) => {
      const difficulty = row.getValue('difficultyLevel') as string;
      return (
        <Badge className={getDifficultyColor(difficulty)}>
          {difficulty}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return getStatusBadge(status);
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: 'actions',
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const question = row.original;
      return (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onView(question)}
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(question)}
            title="Edit question"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(question.id)}
            title="Delete question"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      );
    },
  },
];
