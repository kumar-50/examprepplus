'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Target, 
  CheckCircle2, 
  XCircle, 
  Clock,
  BarChart3,
  Award
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Attempt {
  id: string;
  testId: string;
  testTitle: string;
  testType: string;
  score: number | null;
  totalMarks: number;
  correctAnswers: number | null;
  incorrectAnswers: number | null;
  unanswered: number | null;
  timeSpent: number | null;
  submittedAt: Date | null;
  rank: number | null;
  percentile: number | null;
}

interface Statistics {
  totalTests: number;
  averageScore: number;
  averageAccuracy: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalUnanswered: number;
  testTypeBreakdown: Record<string, { count: number; totalScore: number; totalMarks: number }>;
}

interface TestAnalyticsClientProps {
  analytics: {
    attempts: Attempt[];
    statistics: Statistics;
  };
  userId: string;
}

export function TestAnalyticsClient({ analytics }: TestAnalyticsClientProps) {
  const { attempts, statistics } = analytics;

  const formatTime = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 75) return 'text-green-600';
    if (percentage >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalTests}</div>
            <p className="text-xs text-muted-foreground">
              Tests completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.averageScore.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Points per test
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.averageAccuracy.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Overall accuracy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Correct</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statistics.totalCorrect}</div>
            <p className="text-xs text-muted-foreground">
              Questions answered correctly
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Test Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Test Type</CardTitle>
          <CardDescription>Your performance across different test categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(statistics.testTypeBreakdown).map(([type, data]) => {
              const accuracy = data.totalMarks > 0 ? (data.totalScore / data.totalMarks) * 100 : 0;
              return (
                <div key={type} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Badge variant="outline" className="capitalize mb-2">
                      {type}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {data.count} test{data.count !== 1 ? 's' : ''} completed
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getPercentageColor(accuracy)}`}>
                      {accuracy.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {data.totalScore}/{data.totalMarks} marks
                    </div>
                  </div>
                </div>
              );
            })}
            {Object.keys(statistics.testTypeBreakdown).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No test data available yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Attempts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Test Attempts</CardTitle>
          <CardDescription>Your latest test performances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attempts.slice(0, 10).map((attempt) => {
              const percentage = attempt.totalMarks > 0 
                ? ((attempt.score || 0) / attempt.totalMarks) * 100 
                : 0;
              
              return (
                <div key={attempt.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{attempt.testTitle}</h4>
                      <Badge variant="outline" className="capitalize text-xs">
                        {attempt.testType}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(attempt.timeSpent)}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                        {attempt.correctAnswers}
                      </span>
                      <span className="flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-red-600" />
                        {attempt.incorrectAnswers}
                      </span>
                      {attempt.rank && (
                        <span className="flex items-center gap-1">
                          <Award className="w-3 h-3 text-yellow-600" />
                          Rank #{attempt.rank}
                        </span>
                      )}
                    </div>
                    {attempt.submittedAt && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(attempt.submittedAt), { addSuffix: true })}
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <div className={`text-2xl font-bold ${getPercentageColor(percentage)}`}>
                      {percentage.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {attempt.score}/{attempt.totalMarks}
                    </div>
                    {attempt.percentile !== null && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {(attempt.percentile / 100).toFixed(1)}%ile
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {attempts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No test attempts yet</p>
                <p className="text-sm mt-1">Start taking tests to see your analytics here</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
