'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { History, TrendingUp } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface RevisionHistoryItem {
  id: string;
  title: string;
  submittedAt: Date | null;
  totalQuestions: number;
  correctAnswers: number;
  difficulty: string | null;
}

interface RevisionHistoryProps {
  revisionHistory: RevisionHistoryItem[];
}

const getDifficultyColor = (difficulty: string | null) => {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'medium':
      return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case 'hard':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'mixed':
      return 'bg-prussian-blue-500/10 text-prussian-blue-500 border-prussian-blue-500/20';
    default:
      return 'bg-muted text-muted-foreground border-muted';
  }
};

const getScoreColor = (percentage: number) => {
  if (percentage >= 75) return 'text-green-500';
  if (percentage >= 50) return 'text-orange-500';
  return 'text-red-500';
};

const columns: ColumnDef<RevisionHistoryItem>[] = [
  {
    accessorKey: 'title',
    header: 'Topic',
    cell: ({ row }) => {
      return (
        <div className="font-medium text-xs sm:text-sm min-w-[100px] max-w-[150px] truncate">
          {row.original.title}
        </div>
      );
    },
  },
  {
    accessorKey: 'submittedAt',
    header: 'Date',
    cell: ({ row }) => {
      if (!row.original.submittedAt) return <span className="text-muted-foreground text-xs sm:text-sm">-</span>;
      return (
        <div className="text-xs sm:text-sm text-muted-foreground min-w-[80px]">
          {formatDistanceToNow(new Date(row.original.submittedAt), { addSuffix: true })}
        </div>
      );
    },
  },
  {
    accessorKey: 'score',
    header: 'Score',
    cell: ({ row }) => {
      const percentage = Math.round(
        (row.original.correctAnswers / row.original.totalQuestions) * 100
      );
      return (
        <div className="flex flex-col min-w-[60px]">
          <span className={`text-xs sm:text-sm font-semibold ${getScoreColor(percentage)}`}>
            {percentage}%
          </span>
          <span className="text-xs text-muted-foreground">
            ({row.original.correctAnswers}/{row.original.totalQuestions})
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'difficulty',
    header: 'Difficulty',
    cell: ({ row }) => {
      if (!row.original.difficulty) return null;
      return (
        <div className="min-w-[70px]">
          <Badge
            variant="outline"
            className={`text-xs capitalize ${getDifficultyColor(row.original.difficulty)}`}
          >
            {row.original.difficulty}
          </Badge>
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="text-secondary hover:text-secondary/80 hover:bg-secondary/10 h-8 px-2 sm:px-3 min-w-[60px]"
          asChild
        >
          <Link href={`/dashboard/practice/review/${row.original.id}`}>
            <span className="hidden sm:inline">Review</span>
            <span className="sm:hidden">•••</span>
          </Link>
        </Button>
      );
    },
  },
];

export function RevisionHistory({ revisionHistory }: RevisionHistoryProps) {
  return (
    <Card className="border-prussian-blue-500/20">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-secondary/10">
              <History className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">Revision History</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Your recent practice sessions
              </CardDescription>
            </div>
          </div>
          {revisionHistory.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-secondary hover:text-secondary/80 hover:bg-secondary/10 self-start sm:self-auto"
              asChild
            >
              <Link href="/dashboard/practice/history">
                View All
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {revisionHistory.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-prussian-blue-500/10 mb-4">
              <TrendingUp className="h-8 w-8 text-prussian-blue-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Practice History</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Start practicing to see your progress and improvement over time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <DataTable
              columns={columns}
              data={revisionHistory}
              pageSize={10}
              manualPagination={false}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
