'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, TrendingDown, Clock } from 'lucide-react';
import { useState } from 'react';
import { QuickQuizSheet } from './quick-quiz-sheet';
import { isReviewDue, getDaysUntilReview, getIntervalDescription } from '@/lib/spaced-repetition';
import { formatDistanceToNow } from 'date-fns';

interface WeakTopicCardProps {
  id: string;
  sectionId: string;
  sectionName: string;
  accuracyPercentage: number;
  weaknessLevel: string | null;
  totalAttempts: number;
  correctAttempts: number;
  userId: string;
  nextReviewDate?: Date | null;
  lastPracticedAt?: Date | null;
}

export function WeakTopicCard({
  id,
  sectionId,
  sectionName,
  accuracyPercentage,
  weaknessLevel,
  totalAttempts,
  correctAttempts,
  userId,
  nextReviewDate,
  lastPracticedAt,
}: WeakTopicCardProps) {
  const [isQuizSheetOpen, setIsQuizSheetOpen] = useState(false);

  // Check if review is due
  const reviewDue = nextReviewDate ? isReviewDue(nextReviewDate) : true;
  const daysUntilReview = nextReviewDate ? getDaysUntilReview(nextReviewDate) : 0;

  // Determine severity level and colors
  const getSeverityConfig = () => {
    if (accuracyPercentage < 40) {
      return {
        level: 'Critical',
        borderColor: 'border-red-500/40',
        bgColor: 'bg-red-500/5',
        badgeClass: 'bg-red-500/10 text-red-500 border-red-500/20',
        circleColor: 'text-red-500',
        iconBg: 'bg-red-500/10',
      };
    } else if (accuracyPercentage < 60) {
      return {
        level: 'Moderate',
        borderColor: 'border-orange-500/40',
        bgColor: 'bg-orange-500/5',
        badgeClass: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
        circleColor: 'text-orange-500',
        iconBg: 'bg-orange-500/10',
      };
    } else {
      return {
        level: 'Improving',
        borderColor: 'border-yellow-500/40',
        bgColor: 'bg-yellow-500/5',
        badgeClass: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        circleColor: 'text-yellow-500',
        iconBg: 'bg-yellow-500/10',
      };
    }
  };

  const config = getSeverityConfig();

  // Calculate circle dash offset for progress
  const circumference = 2 * Math.PI * 36; // radius = 36
  const offset = circumference - (accuracyPercentage / 100) * circumference;

  return (
    <>
      <Card className={`${config.borderColor} ${config.bgColor} border-2 transition-all hover:shadow-md`}>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1 line-clamp-1">{sectionName}</h3>
              <Badge variant="outline" className={`text-xs ${config.badgeClass}`}>
                {config.level}
              </Badge>
            </div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.iconBg}`}>
              <TrendingDown className={`h-5 w-5 ${config.circleColor}`} />
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-6 mb-4">
            {/* Accuracy Circle */}
            <div className="relative flex items-center justify-center">
              <svg className="w-20 h-20 transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  className="text-muted/20"
                />
                {/* Progress circle */}
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  className={`${config.circleColor} transition-all duration-500`}
                />
              </svg>
              {/* Centered percentage */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold">{accuracyPercentage}%</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Attempts</span>
                <span className="font-semibold">{totalAttempts}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Correct</span>
                <span className="font-semibold text-green-600">{correctAttempts}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Incorrect</span>
                <span className="font-semibold text-red-600">{totalAttempts - correctAttempts}</span>
              </div>
            </div>
          </div>

          {/* Review Schedule Info */}
          {nextReviewDate && (
            <div className="mb-4 p-2 rounded-lg bg-muted/50 flex items-center gap-2 text-xs">
              <Clock className="h-3 w-3" />
              {reviewDue ? (
                <span className="text-orange-600 font-medium">Review due now</span>
              ) : (
                <span className="text-muted-foreground">
                  Next review: {getIntervalDescription(daysUntilReview)}
                </span>
              )}
              {lastPracticedAt && (
                <span className="text-muted-foreground">
                  • Last practiced {formatDistanceToNow(new Date(lastPracticedAt), { addSuffix: true })}
                </span>
              )}
            </div>
          )}

          {/* Practice Now Button */}
          <Button
            className={`w-full ${
              reviewDue
                ? 'bg-orange-500 hover:bg-orange-600'
                : 'bg-orange-500/80 hover:bg-orange-500'
            } text-white`}
            onClick={() => setIsQuizSheetOpen(true)}
          >
            <Target className="mr-2 h-4 w-4" />
            {reviewDue ? 'Review Now' : 'Practice Now'}
          </Button>
        </CardContent>
      </Card>

      {/* Quick Quiz Sheet with Locked Mode */}
      <QuickQuizSheet
        userId={userId}
        open={isQuizSheetOpen}
        onOpenChange={setIsQuizSheetOpen}
        preSelectedSections={[sectionId]}
        lockSelection={true}
      />
    </>
  );
}
