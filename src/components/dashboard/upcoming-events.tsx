import Link from 'next/link';
import { Calendar, Target, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, format, isPast, differenceInDays } from 'date-fns';

interface GoalDeadline {
  id: string;
  goalType: string;
  goalCategory: string;
  targetValue: number;
  currentValue: number;
  periodEnd: Date;
  progress: number;
}

interface Milestone {
  id: string;
  name: string;
  achievedAt: Date;
  type: string;
}

interface UpcomingEventsProps {
  goalDeadlines: GoalDeadline[];
  recentMilestones: Milestone[];
}

/**
 * Upcoming Events Card
 * Shows goal deadlines, practice reminders, and recent milestones
 * (No exam countdown per user request)
 */
export function UpcomingEvents({
  goalDeadlines,
  recentMilestones,
}: UpcomingEventsProps) {
  const hasEvents = goalDeadlines.length > 0 || recentMilestones.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Upcoming Events
        </CardTitle>
        <CardDescription>Goals, deadlines, and milestones</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {!hasEvents ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No upcoming events</p>
            <p className="text-xs mt-1">Set goals to track your progress!</p>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link href="/dashboard/progress">Set Goals</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Goal Deadlines */}
            {goalDeadlines.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Goal Deadlines
                </h4>
                
                {goalDeadlines.map((goal) => {
                  const daysRemaining = differenceInDays(new Date(goal.periodEnd), new Date());
                  const isOverdue = isPast(new Date(goal.periodEnd));
                  const isUrgent = daysRemaining <= 3 && !isOverdue;
                  
                  return (
                    <div
                      key={goal.id}
                      className={`flex items-start gap-3 p-3 border rounded-lg ${
                        isOverdue 
                          ? 'border-destructive bg-destructive/5' 
                          : isUrgent 
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' 
                          : ''
                      }`}
                    >
                      <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                        isOverdue 
                          ? 'bg-destructive/10' 
                          : isUrgent 
                          ? 'bg-orange-100 dark:bg-orange-900/30' 
                          : 'bg-primary/10'
                      }`}>
                        <Target className={`h-5 w-5 ${
                          isOverdue 
                            ? 'text-destructive' 
                            : isUrgent 
                            ? 'text-orange-600 dark:text-orange-500' 
                            : 'text-primary'
                        }`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h5 className="font-medium text-sm capitalize truncate">
                              {goal.goalType.replace('_', ' ')} Goal
                            </h5>
                            <p className="text-xs text-muted-foreground">
                              Target: {goal.targetValue} • Current: {goal.currentValue}
                            </p>
                          </div>
                          <Badge 
                            variant={isOverdue ? 'destructive' : isUrgent ? 'secondary' : 'outline'}
                            className="flex-shrink-0"
                          >
                            {goal.progress}%
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {isOverdue ? (
                            <span className="text-destructive font-medium">Overdue</span>
                          ) : (
                            <span>
                              {daysRemaining === 0 
                                ? 'Due today' 
                                : daysRemaining === 1 
                                ? 'Due tomorrow' 
                                : `${daysRemaining} days remaining`}
                            </span>
                          )}
                        </div>
                        
                        {/* Progress bar */}
                        <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isOverdue 
                                ? 'bg-destructive' 
                                : isUrgent 
                                ? 'bg-orange-500' 
                                : 'bg-primary'
                            }`}
                            style={{ width: `${Math.min(goal.progress, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Recent Milestones */}
            {recentMilestones.length > 0 && (
              <div className="space-y-3 border-t pt-4">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Recent Milestones
                </h4>
                
                {recentMilestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="flex items-center gap-3 p-3 border rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20"
                  >
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-sm truncate">{milestone.name}</h5>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(milestone.achievedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* View All Link */}
            <div className="border-t pt-4">
              <Button variant="ghost" size="sm" className="w-full justify-between group" asChild>
                <Link href="/dashboard/progress">
                  View All Goals
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
