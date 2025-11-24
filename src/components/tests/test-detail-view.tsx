'use client';

import { useState } from 'react';
import { Clock, FileText, Star, Lock, Play, TrendingUp, Trophy, AlertCircle, Medal, CheckCircle2, XCircle, Award, Target, BarChart3, Lightbulb, MinusCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Test {
  id: string;
  title: string;
  description: string | null;
  testType: string;
  totalQuestions: number;
  totalMarks: number;
  duration: number;
  isFree: boolean;
  bannerImage: string | null;
  averageRating: number | null;
  totalRatings: number | null;
  totalAttempts: number | null;
  instructions: string | null;
}

interface Section {
  id: string;
  name: string;
  questionCount: number;
  description: string | null;
}

interface Attempt {
  id: string;
  score: number | null;
  startedAt: Date;
  submittedAt: Date | null;
  status: string;
  correctAnswers: number | null;
  incorrectAnswers: number | null;
  unanswered: number | null;
}

interface LeaderboardEntry {
  attemptId: string;
  userId: string;
  userName: string;
  score: number | null;
  totalMarks: number;
  correctAnswers: number | null;
  incorrectAnswers: number | null;
  timeSpent: number | null;
  submittedAt: Date | null;
  rank: number;
  percentage: number;
}

interface Analytics {
  attempts: Array<{
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
  }>;
  statistics: {
    totalTests: number;
    averageScore: number;
    averageAccuracy: number;
    totalCorrect: number;
    totalIncorrect: number;
    totalUnanswered: number;
    testTypeBreakdown: Record<string, { count: number; totalScore: number; totalMarks: number }>;
  };
}

interface ReviewAnswer {
  questionId: string;
  questionText: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correctOption: number;
  selectedOption: number | null;
  isCorrect: boolean | null;
  explanation: string | null;
  questionOrder: number;
}

interface ReviewData {
  attempt: {
    id: string;
    score: number | null;
    correctAnswers: number | null;
    incorrectAnswers: number | null;
    unanswered: number | null;
    timeSpent: number | null;
    rank: number | null;
    percentile: number | null;
  };
  test: {
    id: string;
    title: string;
    totalMarks: number;
  };
  answers: ReviewAnswer[];
}

interface TestDetailViewProps {
  test: Test;
  userId: string;
  attemptHistory: Attempt[];
  leaderboard: LeaderboardEntry[];
  analytics: Analytics;
  review: ReviewData | null;
}

export function TestDetailView({ test, userId, attemptHistory, leaderboard, analytics, review }: TestDetailViewProps) {
  // Check if user has completed this test
  const hasCompleted = attemptHistory.some(
    attempt => attempt.status === 'submitted' || attempt.status === 'auto_submitted'
  );
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Banner */}
        <div className="bg-muted rounded-lg h-64 flex items-center justify-center">
          {test.bannerImage ? (
            <img src={test.bannerImage} alt={test.title} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <span className="text-6xl">📝</span>
          )}
        </div>

        {/* Title and Metadata */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">
            {test.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4">
            <Badge className="text-white">
              <Clock className="w-4 h-4 mr-1" />
              {test.duration} min
            </Badge>
            <Badge className="text-white">
              <FileText className="w-4 h-4 mr-1" />
              {test.totalQuestions} Questions
            </Badge>
            <Badge variant="outline" className="capitalize">
              {test.testType}
            </Badge>
            {test.averageRating && test.totalRatings ? (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{test.averageRating.toFixed(1)}</span>
                <span className="text-muted-foreground">({test.totalRatings})</span>
              </div>
            ) : null}
          </div>

          {test.description && (
            <p className="text-muted-foreground leading-relaxed">
              {test.description}
            </p>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="leaderboard" className="w-full">
          <TabsList>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            {review && <TabsTrigger value="review">Review</TabsTrigger>}
          </TabsList>

          <TabsContent value="leaderboard" className="mt-6">
            <LeaderboardTab leaderboard={leaderboard} currentUserId={userId} test={test} />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <AnalyticsTab analytics={analytics} testId={test.id} />
          </TabsContent>

          {review && (
            <TabsContent value="review" className="mt-6">
              <ReviewTab review={review} />
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-card rounded-lg border p-6 sticky top-8 space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Take the Test</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ready to test your knowledge?
            </p>

            {hasCompleted ? (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You have already completed this test. Each test can only be attempted once.
                </AlertDescription>
              </Alert>
            ) : null}

            {test.isFree ? (
              hasCompleted ? (
                <Button className="w-full" size="lg" disabled>
                  <Lock className="w-5 h-5 mr-2" />
                  Test Completed
                </Button>
              ) : (
                <Link href={`/dashboard/tests/${test.id}/attempt`}>
                  <Button className="w-full" size="lg">
                    <Play className="w-5 h-5 mr-2" />
                    Start Test
                  </Button>
                </Link>
              )
            ) : (
              <Button className="w-full" size="lg" variant="outline">
                <Lock className="w-5 h-5 mr-2" />
                Unlock Test
              </Button>
            )}
          </div>

          {test.averageRating !== null && (
            <div className="pt-4 border-t">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">
                  {test.averageRating.toFixed(1)} ⭐
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on {test.totalRatings} ratings
                </p>
              </div>
            </div>
          )}

          {test.totalAttempts !== null && test.totalAttempts > 0 && (
            <div className="text-center text-sm text-muted-foreground">
              Attempted by {test.totalAttempts.toLocaleString()} users
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Leaderboard Tab Component
function LeaderboardTab({ leaderboard, currentUserId, test }: { 
  leaderboard: LeaderboardEntry[]; 
  currentUserId: string;
  test: { id: string; title: string; totalMarks: number };
}) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-700" />;
      default:
        return null;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) {
      return (
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg",
          rank === 1 && "bg-yellow-500/20 text-yellow-600",
          rank === 2 && "bg-gray-400/20 text-gray-600",
          rank === 3 && "bg-amber-700/20 text-amber-700"
        )}>
          {rank}
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-medium text-sm text-muted-foreground">
        {rank}
      </div>
    );
  };

  const formatTime = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentUserEntry = leaderboard.find(entry => entry.userId === currentUserId);

  if (leaderboard.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No submissions yet</p>
        <p className="text-sm mt-1">Be the first to complete this test!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current User Position */}
      {currentUserEntry && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="w-5 h-5" />
              Your Position
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getRankBadge(currentUserEntry.rank)}
                <div>
                  <div className="font-semibold">{currentUserEntry.userName}</div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(currentUserEntry.timeSpent)}
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                      {currentUserEntry.correctAnswers}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {currentUserEntry.percentage}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {currentUserEntry.score}/{currentUserEntry.totalMarks}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top 10 Rankings */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
          <CardDescription>Best scores for this test</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboard.slice(0, 10).map((entry) => {
              const isCurrentUser = entry.userId === currentUserId;

              return (
                <div
                  key={entry.attemptId}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-colors",
                    isCurrentUser ? "bg-primary/5 border-primary" : "hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center gap-2 w-12">
                      {getRankBadge(entry.rank)}
                      {entry.rank <= 3 && getRankIcon(entry.rank)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold flex items-center gap-2 truncate">
                        {entry.userName}
                        {isCurrentUser && (
                          <Badge variant="outline" className="text-xs">You</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(entry.timeSpent)}
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-green-600" />
                          {entry.correctAnswers}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-xl font-bold">
                      {entry.score}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {entry.percentage}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {leaderboard.length > 10 && (
            <div className="mt-4 text-center">
              <Link href={`/dashboard/tests/${test.id}/leaderboard`}>
                <Button variant="outline" size="sm">
                  View Full Leaderboard ({leaderboard.length} total)
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Analytics Tab Component
function AnalyticsTab({ analytics, testId }: { analytics: Analytics; testId: string }) {
  const { statistics } = analytics;
  
  const getPercentageColor = (percentage: number) => {
    if (percentage >= 75) return 'text-green-600';
    if (percentage >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatTime = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Filter attempts for this specific test
  const testAttempts = analytics.attempts.filter(a => a.testId === testId);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Total Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalTests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              Avg Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.averageScore.toFixed(1)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.averageAccuracy.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              Correct
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statistics.totalCorrect}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Attempts for This Test */}
      {testAttempts.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Your Attempts</CardTitle>
            <CardDescription>Your performance history for this test</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testAttempts.map((attempt) => {
                const percentage = attempt.totalMarks > 0 
                  ? ((attempt.score || 0) / attempt.totalMarks) * 100 
                  : 0;
                
                return (
                  <div key={attempt.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
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
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No attempts yet for this test</p>
            <p className="text-sm mt-1">Start the test to see your analytics here</p>
          </CardContent>
        </Card>
      )}

      {/* View All Analytics */}
      <div className="text-center">
        <Link href="/dashboard/tests/analytics">
          <Button variant="outline">
            <TrendingUp className="w-4 h-4 mr-2" />
            View Complete Analytics
          </Button>
        </Link>
      </div>
    </div>
  );
}

// Review Tab Component
function ReviewTab({ review }: { review: ReviewData }) {
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect' | 'unanswered'>('all');
  
  const { attempt, test, answers } = review;

  const filteredAnswers = answers.filter(answer => {
    if (filter === 'correct') return answer.isCorrect === true;
    if (filter === 'incorrect') return answer.selectedOption !== null && answer.isCorrect === false;
    if (filter === 'unanswered') return answer.selectedOption === null;
    return true;
  });

  const getOptionLabel = (index: number) => {
    return ['A', 'B', 'C', 'D'][index - 1];
  };

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle>Question-by-Question Review</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant={filter === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('all')}
              >
                All ({answers.length})
              </Button>
              <Button 
                variant={filter === 'correct' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('correct')}
                className={filter === 'correct' ? '' : 'text-green-600'}
              >
                Correct ({attempt.correctAnswers || 0})
              </Button>
              <Button 
                variant={filter === 'incorrect' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('incorrect')}
                className={filter === 'incorrect' ? '' : 'text-red-600'}
              >
                Incorrect ({attempt.incorrectAnswers || 0})
              </Button>
              <Button 
                variant={filter === 'unanswered' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('unanswered')}
              >
                Skipped ({attempt.unanswered || 0})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {filteredAnswers.map((answer) => {
              const options = [
                { num: 1, text: answer.option1 },
                { num: 2, text: answer.option2 },
                { num: 3, text: answer.option3 },
                { num: 4, text: answer.option4 },
              ];

              return (
                <div key={answer.questionId} className="border rounded-lg p-6">
                  {/* Question Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <Badge variant="outline" className="mt-1">
                      Q{answer.questionOrder}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-base leading-relaxed">{answer.questionText}</p>
                    </div>
                    {answer.isCorrect === true && (
                      <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                    )}
                    {answer.isCorrect === false && answer.selectedOption !== null && (
                      <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                    )}
                    {answer.selectedOption === null && (
                      <MinusCircle className="w-6 h-6 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>

                  {/* Options */}
                  <div className="space-y-2 mb-4">
                    {options.map((option) => {
                      const isCorrect = option.num === answer.correctOption;
                      const isSelected = option.num === answer.selectedOption;
                      const isWrong = isSelected && !isCorrect;

                      return (
                        <div
                          key={option.num}
                          className={cn(
                            "p-3 rounded-lg border-2 transition-colors",
                            isCorrect && "bg-green-50 dark:bg-green-950/20 border-green-500",
                            isWrong && "bg-red-50 dark:bg-red-950/20 border-red-500",
                            !isCorrect && !isSelected && "bg-muted/30 border-muted"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0",
                              isCorrect && "bg-green-600 text-white",
                              isWrong && "bg-red-600 text-white",
                              !isCorrect && !isSelected && "bg-muted text-muted-foreground"
                            )}>
                              {getOptionLabel(option.num)}
                            </div>
                            <span className={cn(
                              "flex-1",
                              (isCorrect || isWrong) && "font-medium"
                            )}>
                              {option.text}
                            </span>
                            {isCorrect && (
                              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                                Correct Answer
                              </Badge>
                            )}
                            {isSelected && !isCorrect && (
                              <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                                Your Answer
                              </Badge>
                            )}
                            {isSelected && isCorrect && (
                              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                                Your Answer
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {answer.explanation && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Explanation</h4>
                          <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                            {answer.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredAnswers.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No questions match this filter
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
