/**
 * Recent Activity Feed Component
 * Displays recent test attempts
 */

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ActivityItem } from './activity-item';

interface RecentTest {
  id: string;
  testId: string;
  name: string;
  testType: string;
  accuracy: number;
  submittedAt: Date;
  totalQuestions: number;
  correctAnswers: number;
  status: string;
}

interface RecentActivityFeedProps {
  tests: RecentTest[];
}

export function RecentActivityFeed({ tests }: RecentActivityFeedProps) {
  if (tests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">📋</span>
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-semibold mb-2">No tests yet</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              Start your learning journey by taking your first test.
            </p>
            <Link href="/dashboard/tests">
              <Button>Browse Tests</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">📋</span>
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tests.map((test) => (
          <ActivityItem key={test.id} test={test} />
        ))}
        
        {tests.length >= 5 && (
          <div className="pt-2">
            <Link href="/dashboard/tests">
              <Button variant="outline" className="w-full">
                View All Tests →
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
