/**
 * Goal Progress Item Component
 * Individual goal with progress bar
 */

import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface GoalProgressItemProps {
  goal: {
    id: string;
    goalType: string;
    goalCategory: string;
    targetValue: number;
    currentValue: number;
    periodEnd: Date;
    progress: number;
  };
}

export function GoalProgressItem({ goal }: GoalProgressItemProps) {
  const goalCategoryLabels: Record<string, string> = {
    questions: 'Questions',
    accuracy: 'Accuracy',
    time: 'Study Time',
    tests: 'Tests',
    sections: 'Sections',
    streak: 'Streak Days',
  };

  const goalTypeLabels: Record<string, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
  };

  const categoryLabel = goalCategoryLabels[goal.goalCategory] || goal.goalCategory;
  const typeLabel = goalTypeLabels[goal.goalType] || goal.goalType;
  const deadline = format(new Date(goal.periodEnd), 'MMM d');

  // Determine color based on progress
  const getProgressColorClass = (progress: number) => {
    if (progress >= 80) return '[&>div]:bg-green-500';
    if (progress >= 50) return '[&>div]:bg-yellow-500';
    return '[&>div]:bg-orange-500';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium">
            {typeLabel} {categoryLabel}
          </p>
          <p className="text-xs text-muted-foreground">
            {Math.round(goal.currentValue)}/{Math.round(goal.targetValue)} • Due {deadline}
          </p>
        </div>
        <div className="text-sm font-semibold">{goal.progress}%</div>
      </div>
      <Progress value={goal.progress} className={cn("h-2", getProgressColorClass(goal.progress))} />
    </div>
  );
}
