/**
 * Quick Actions Panel Component
 * Primary action buttons for common tasks
 */

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QuickActionsPanelProps {
  hasInProgressTest: boolean;
  weakTopicsCount: number;
}

export function QuickActionsPanel({ hasInProgressTest, weakTopicsCount }: QuickActionsPanelProps) {
  const actions = [
    {
      icon: '🎯',
      title: 'Start Quick Practice',
      description: '10-15 questions',
      href: '/dashboard/practice',
      variant: 'default' as const,
      show: true,
    },
    {
      icon: '▶️',
      title: 'Continue Last Test',
      description: 'Resume where you left off',
      href: '/dashboard/tests', // Will need to add logic to find in-progress test
      variant: 'secondary' as const,
      show: hasInProgressTest,
    },
    {
      icon: '📝',
      title: 'Take Mock Test',
      description: 'Full-length test',
      href: '/dashboard/tests?type=mock',
      variant: 'outline' as const,
      show: true,
    },
    {
      icon: '🔍',
      title: 'Review Mistakes',
      description: weakTopicsCount > 0 ? `${weakTopicsCount} weak areas` : 'Practice weak topics',
      href: '/dashboard/practice?focus=weak',
      variant: 'outline' as const,
      show: true,
    },
  ];

  const visibleActions = actions.filter(a => a.show);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {visibleActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Button
                variant={action.variant}
                className="w-full h-auto flex flex-col items-start gap-2 p-4"
              >
                <div className="flex items-center gap-2 w-full">
                  <span className="text-2xl">{action.icon}</span>
                  <span className="font-semibold text-sm">{action.title}</span>
                </div>
                <span className="text-xs text-left opacity-80">{action.description}</span>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
