'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { History, TrendingUp, Clock, Target, Award, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatDistanceToNow, format, isToday, isYesterday, isThisWeek } from 'date-fns';

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

const getDateGroup = (date: Date | null) => {
  if (!date) return 'Unknown';
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (isThisWeek(date)) return 'This Week';
  return 'Older';
};

export function RevisionHistory({ revisionHistory }: RevisionHistoryProps) {
  // Group history by date
  const groupedHistory = revisionHistory.reduce((acc, item) => {
    const group = getDateGroup(item.submittedAt);
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {} as Record<string, RevisionHistoryItem[]>);

  const groupOrder = ['Today', 'Yesterday', 'This Week', 'Older', 'Unknown'];
  const sortedGroups = groupOrder.filter(group => (groupedHistory[group]?.length ?? 0) > 0);

  return (
    <Card className="border-prussian-blue-500/20">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
            <History className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <CardTitle>Revision History</CardTitle>
            <CardDescription>
              Your recent practice sessions
            </CardDescription>
          </div>
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
          <div className="space-y-6">
            {sortedGroups.map((group) => (
              <div key={group}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">{group}</h3>
                <div className="space-y-3">
                  {(groupedHistory[group] ?? []).map((item) => {
                    const percentage = Math.round(
                      (item.correctAnswers / item.totalQuestions) * 100
                    );
                    return (
                      <Link
                        key={item.id}
                        href={`/dashboard/practice/review/${item.id}`}
                        className="block"
                      >
                        <div className="group rounded-lg border p-4 hover:border-primary/50 hover:bg-accent/50 transition-all">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium truncate">{item.title}</h4>
                                {item.difficulty && (
                                  <Badge
                                    variant="outline"
                                    className={`text-xs capitalize ${getDifficultyColor(item.difficulty)}`}
                                  >
                                    {item.difficulty}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span className="text-xs">
                                    {item.submittedAt
                                      ? formatDistanceToNow(new Date(item.submittedAt), { addSuffix: true })
                                      : 'Unknown'}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-1.5">
                                  <Target className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    {item.correctAnswers}/{item.totalQuestions} correct
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-1.5">
                                  <Award className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span className={`text-xs font-semibold ${getScoreColor(percentage)}`}>
                                    {percentage}%
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
