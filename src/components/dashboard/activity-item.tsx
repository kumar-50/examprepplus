/**
 * Activity Item Component
 * Individual test activity display
 */

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getAccuracyColor } from '@/lib/dashboard/stats';

interface ActivityItemProps {
  test: {
    id: string;
    testId: string;
    name: string;
    testType: string;
    accuracy: number;
    submittedAt: Date;
    totalQuestions: number;
    correctAnswers: number;
  };
}

export function ActivityItem({ test }: ActivityItemProps) {
  const accuracyColor = getAccuracyColor(test.accuracy);
  const timeAgo = formatDistanceToNow(new Date(test.submittedAt), { addSuffix: true });

  const colorClasses = {
    green: 'text-green-600 dark:text-green-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    red: 'text-red-600 dark:text-red-400',
  };

  const badgeVariant = {
    green: 'default' as const,
    yellow: 'secondary' as const,
    red: 'destructive' as const,
  };

  const testTypeLabels: Record<string, string> = {
    'mock': 'Mock Test',
    'live': 'Live Test',
    'sectional': 'Sectional Test',
    'practice': 'Practice',
  };

  // Determine review URL based on test type
  // Practice tests: /dashboard/practice/review/[sessionId]
  // Other tests: /dashboard/tests/[testId]/attempt/[attemptId]/review
  const reviewUrl = test.testType === 'practice'
    ? `/dashboard/practice/review/${test.id}` // test.id is the sessionId for practice
    : `/dashboard/tests/${test.testId}/attempt/${test.id}/review`; // test.id is attemptId

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-4 hover:bg-accent transition-colors">
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm">{test.name}</h4>
          <Badge variant="outline" className="text-xs">
            {testTypeLabels[test.testType] || test.testType}
          </Badge>
        </div>
        
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className={cn('font-semibold', colorClasses[accuracyColor])}>
            {test.accuracy.toFixed(1)}%
          </span>
          <span>•</span>
          <span>{test.correctAnswers}/{test.totalQuestions} correct</span>
          <span>•</span>
          <span>{timeAgo}</span>
        </div>
      </div>
      
      <Link href={reviewUrl}>
        <Button size="sm" variant="ghost">
          Review →
        </Button>
      </Link>
    </div>
  );
}
