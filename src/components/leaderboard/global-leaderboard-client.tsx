'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Clock, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  userId: string;
  userName: string;
  totalTests: number;
  totalScore: number;
  averageScore: number;
  totalCorrect: number;
  totalIncorrect: number;
  rank: number;
}

interface GlobalLeaderboardClientProps {
  leaderboard: LeaderboardEntry[];
  currentUserId: string;
}

export function GlobalLeaderboardClient({ leaderboard, currentUserId }: GlobalLeaderboardClientProps) {
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

  const currentUserRank = leaderboard.find(entry => entry.userId === currentUserId);

  return (
    <div className="space-y-6">
      {/* Current User Card */}
      {currentUserRank && (
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
                {getRankBadge(currentUserRank.rank)}
                <div>
                  <div className="font-semibold">{currentUserRank.userName}</div>
                  <div className="text-sm text-muted-foreground">
                    {currentUserRank.totalTests} test{currentUserRank.totalTests !== 1 ? 's' : ''} completed
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {currentUserRank.averageScore.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Average Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>The best of the best</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {/* 2nd Place */}
              <div className="flex flex-col items-center pt-8">
                <Medal className="w-12 h-12 text-gray-400 mb-2" />
                <div className="text-center">
                  <div className="font-semibold text-sm">{leaderboard[1]?.userName}</div>
                  <div className="text-2xl font-bold text-gray-600 mt-1">
                    {leaderboard[1]?.averageScore.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {leaderboard[1]?.totalTests} tests
                  </div>
                </div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center">
                <Trophy className="w-16 h-16 text-yellow-500 mb-2" />
                <div className="text-center">
                  <div className="font-bold">{leaderboard[0]?.userName}</div>
                  <div className="text-3xl font-bold text-yellow-600 mt-1">
                    {leaderboard[0]?.averageScore.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {leaderboard[0]?.totalTests} tests
                  </div>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center pt-12">
                <Medal className="w-10 h-10 text-amber-700 mb-2" />
                <div className="text-center">
                  <div className="font-semibold text-sm">{leaderboard[2]?.userName}</div>
                  <div className="text-xl font-bold text-amber-700 mt-1">
                    {leaderboard[2]?.averageScore.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {leaderboard[2]?.totalTests} tests
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
          <CardTitle>All Rankings</CardTitle>
          <CardDescription>Complete leaderboard standings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboard.map((entry, index) => {
              const isCurrentUser = entry.userId === currentUserId;
              const accuracy = entry.totalCorrect + entry.totalIncorrect > 0
                ? (entry.totalCorrect / (entry.totalCorrect + entry.totalIncorrect)) * 100
                : 0;

              return (
                <div
                  key={entry.userId}
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
                          <Target className="w-3 h-3" />
                          {entry.totalTests} tests
                        </span>
                        <span>
                          {accuracy.toFixed(1)}% accuracy
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold">
                      {entry.averageScore.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Avg Score
                    </div>
                  </div>
                </div>
              );
            })}
            {leaderboard.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No leaderboard data yet</p>
                <p className="text-sm mt-1">Be the first to complete tests and appear here!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
