'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Target, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { QuickQuizSheet } from './quick-quiz-sheet';

interface UpcomingPractice {
  id: string;
  scheduledDate: Date;
  topicIds: string | null;
  difficulty: string | null;
  questionCount: number;
  attemptId: string | null;
}

interface SpacedRepetitionQueueProps {
  upcomingPractice: UpcomingPractice[];
  userId: string;
}

export function SpacedRepetitionQueue({ upcomingPractice, userId }: SpacedRepetitionQueueProps) {
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

  const formatScheduledTime = (date: Date) => {
    const now = new Date();
    const scheduledDate = new Date(date);
    const diffInHours = (scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return formatDistanceToNow(scheduledDate, { addSuffix: true });
    } else {
      return scheduledDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: scheduledDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const isOverdue = (date: Date) => {
    return new Date(date) < new Date();
  };

  return (
    <Card className="border-prussian-blue-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
              <Target className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Spaced Repetition Queue</CardTitle>
              <CardDescription className="text-sm">
                Upcoming practice sessions
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {upcomingPractice.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-prussian-blue-500/10 mb-4">
              <Calendar className="h-8 w-8 text-prussian-blue-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Scheduled Practice</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Schedule practice sessions to reinforce your learning with spaced repetition.
            </p>
            <QuickQuizSheet
              userId={userId}
              defaultTab="schedule"
              triggerButton={
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Practice
                </Button>
              }
            />
          </div>
        ) : (
          // Practice Queue List
          <div className="space-y-3">
            {upcomingPractice.map((practice) => {
              const overdue = isOverdue(practice.scheduledDate);
              const topicCount = practice.topicIds ? practice.topicIds.split(',').length : 0;
              const isCompleted = !!practice.attemptId; // Has attempt means it's been started/completed
              
              return (
                <div
                  key={practice.id}
                  className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
                    overdue
                      ? 'border-orange-500/30 bg-orange-500/5'
                      : 'border-prussian-blue-500/10 hover:bg-accent/50'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        overdue ? 'bg-orange-500/20' : 'bg-prussian-blue-500/10'
                      }`}
                    >
                      {practice.attemptId ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Clock className={`h-5 w-5 ${overdue ? 'text-orange-500' : 'text-prussian-blue-500'}`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {topicCount || 0}{' '}
                          {topicCount === 1 ? 'Topic' : 'Topics'}
                        </span>
                        {practice.difficulty && (
                          <Badge
                            variant="outline"
                            className={`text-xs capitalize ${getDifficultyColor(practice.difficulty)}`}
                          >
                            {practice.difficulty}
                          </Badge>
                        )}
                        {overdue && !isCompleted && (
                          <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-500 border-orange-500/20">
                            Overdue
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatScheduledTime(practice.scheduledDate)}
                        </span>
                        <span>{practice.questionCount} questions</span>
                      </div>
                    </div>
                  </div>
                  {!isCompleted && (
                    <Button
                      size="sm"
                      variant={overdue ? 'default' : 'ghost'}
                      className={
                        overdue
                          ? 'bg-orange-500 hover:bg-orange-600 text-white'
                          : 'text-orange-500 hover:text-orange-600 hover:bg-orange-500/10'
                      }
                      asChild
                    >
                      <Link href={`/dashboard/practice/start/${practice.id}`}>
                        {overdue ? 'Start Now' : 'Begin'}
                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
