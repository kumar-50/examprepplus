'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Clock, Target, CheckCircle2, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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

interface Test {
  id: string;
  title: string;
  totalMarks: number;
}

interface TestLeaderboardClientProps {
  leaderboard: LeaderboardEntry[];
  currentUserId: string;
  test: Test;
}

export function TestLeaderboardClient({ leaderboard, currentUserId, test }: TestLeaderboardClientProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-700" />;
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
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-medium text-muted-foreground">
        {rank}
      </div>
    );
  };

  const formatTime = (seconds: number | null | undefined) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentUserEntry = leaderboard.find(entry => entry.userId === currentUserId);

  return (
    <div className="space-y-6">
      {/* Test Info */}
      <Card>
        <CardHeader>
          <CardTitle>Test Information</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Total Participants</div>
            <div className="text-2xl font-bold">{leaderboard.length}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Maximum Score</div>
            <div className="text-2xl font-bold">{test.totalMarks}</div>
          </div>
          <div>
            <Link href={`/dashboard/tests/${test.id}`}>
              <Button variant="outline">View Test Details</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Current User Position */}
      {currentUserEntry && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
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
                      <CheckCircle2 className="w-3 h-3" />
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

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Top 3 Performers</CardTitle>
            <CardDescription>Highest scorers for this test</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {/* 2nd Place */}
              <div className="flex flex-col items-center pt-8">
                <Medal className="w-12 h-12 text-gray-400 mb-2" />
                <div className="text-center">
                  <div className="font-semibold text-sm">{leaderboard[1]?.userName}</div>
                  <div className="text-2xl font-bold text-gray-600 mt-1">
                    {leaderboard[1]?.percentage}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {leaderboard[1]?.score}/{leaderboard[1]?.totalMarks}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatTime(leaderboard[1]?.timeSpent)}
                  </div>
                </div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center">
                <Trophy className="w-16 h-16 text-yellow-500 mb-2" />
                <div className="text-center">
                  <div className="font-bold">{leaderboard[0]?.userName}</div>
                  <div className="text-3xl font-bold text-yellow-600 mt-1">
                    {leaderboard[0]?.percentage}%
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {leaderboard[0]?.score}/{leaderboard[0]?.totalMarks}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatTime(leaderboard[0]?.timeSpent)}
                  </div>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center pt-12">
                <Medal className="w-10 h-10 text-amber-700 mb-2" />
                <div className="text-center">
                  <div className="font-semibold text-sm">{leaderboard[2]?.userName}</div>
                  <div className="text-xl font-bold text-amber-700 mt-1">
                    {leaderboard[2]?.percentage}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {leaderboard[2]?.score}/{leaderboard[2]?.totalMarks}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatTime(leaderboard[2]?.timeSpent)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Rankings</CardTitle>
          <CardDescription>All test participants ordered by score and time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboard.map((entry, index) => {
              const isCurrentUser = entry.userId === currentUserId;

              return (
                <div
                  key={entry.attemptId}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border transition-colors",
                    isCurrentUser ? "bg-primary/5 border-primary" : "hover:bg-muted/50",
                    index < 3 && "bg-muted/30"
                  )}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2 w-16">
                      {getRankBadge(entry.rank)}
                      {index < 3 && getRankIcon(entry.rank)}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold flex items-center gap-2">
                        {entry.userName}
                        {isCurrentUser && (
                          <Badge variant="outline" className="text-xs">You</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(entry.timeSpent)}
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-green-600" />
                          {entry.correctAnswers}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {entry.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold">
                      {entry.score}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      / {entry.totalMarks}
                    </div>
                  </div>
                </div>
              );
            })}
            {leaderboard.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No submissions yet</p>
                <p className="text-sm mt-1">Be the first to complete this test!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
