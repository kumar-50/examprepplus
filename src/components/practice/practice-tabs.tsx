'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WeakTopicsSection } from '@/components/practice/weak-topics-section';
import { SpacedRepetitionQueue } from '@/components/practice/spaced-repetition-queue';
import { RevisionHistory } from '@/components/practice/revision-history';
import { StreakCard } from '@/components/practice/streak-card';
import { PracticeCalendar } from '@/components/practice/practice-calendar';
import { Brain, History, Clock, Flame, Crown, Lock } from 'lucide-react';
import { useAccessControl } from '@/hooks/use-access-control';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SubscriptionModal } from '@/components/subscription/subscription-modal';

interface WeakTopic {
  id: string;
  sectionId: string;
  sectionName: string;
  accuracyPercentage: number;
  weaknessLevel: string | null;
  totalAttempts: number;
  correctAttempts: number;
  nextReviewDate: Date | null;
  lastPracticedAt: Date | null;
}

interface UpcomingPractice {
  id: string;
  scheduledDate: Date;
  topicIds: string | null;
  difficulty: string | null;
  questionCount: number;
  attemptId: string | null;
}

interface RevisionHistoryItem {
  id: string;
  title: string | null;
  submittedAt: Date | null;
  totalQuestions: number | null;
  correctAnswers: number;
  difficulty: string | null;
}

interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalPracticeDays: number;
  lastPracticeDate: Date | null;
  streakStartDate: Date | null;
  streakStatus: 'active' | 'at-risk' | 'broken';
  isActiveToday: boolean;
}

interface CalendarDay {
  date: Date;
  questionsAnswered: number;
  correctAnswers: number;
  practiceMinutes: number;
  sessionsCompleted: number;
  accuracy: number;
}

interface PracticeTabsProps {
  weakTopics: WeakTopic[];
  upcomingPractice: UpcomingPractice[];
  revisionHistory: RevisionHistoryItem[];
  userId: string;
  streakStats: StreakStats;
  calendarData: CalendarDay[];
}

export function PracticeTabs({ 
  weakTopics, 
  upcomingPractice, 
  revisionHistory, 
  userId,
  streakStats,
  calendarData
}: PracticeTabsProps) {
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { isPremium, canAccess, loading: accessLoading } = useAccessControl();
  
  // Check if user can access weak topics (premium feature)
  const canAccessWeakTopics = isPremium || canAccess('weak_topics');

  console.log('🎯 PracticeTabs props:', {
    weakTopicsCount: weakTopics?.length ?? 'undefined',
    upcomingCount: upcomingPractice?.length ?? 'undefined',
    historyCount: revisionHistory?.length ?? 'undefined',
    userId,
    isPremium,
    canAccessWeakTopics
  });

  return (
    <Tabs defaultValue="weak-topics" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="weak-topics" className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          <span className="hidden sm:inline">Weak Topics</span>
          <span className="sm:hidden">Topics</span>
          {weakTopics.length > 0 && (
            <span className="ml-1 rounded-full bg-orange-500 px-1.5 py-0.5 text-xs text-white">
              {weakTopics.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="scheduled" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span className="hidden sm:inline">Scheduled</span>
          <span className="sm:hidden">Queue</span>
          {upcomingPractice.length > 0 && (
            <span className="ml-1 rounded-full bg-blue-500 px-1.5 py-0.5 text-xs text-white">
              {upcomingPractice.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="streak" className="flex items-center gap-2">
          <Flame className="h-4 w-4" />
          <span className="hidden sm:inline">Streak</span>
          <span className="sm:hidden">🔥</span>
        </TabsTrigger>
        <TabsTrigger value="history" className="flex items-center gap-2">
          <History className="h-4 w-4" />
          <span className="hidden sm:inline">History</span>
          <span className="sm:hidden">Past</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="weak-topics" className="mt-6">
        {canAccessWeakTopics ? (
          <WeakTopicsSection weakTopics={weakTopics} userId={userId} />
        ) : (
          <Card className="border-amber-200 dark:border-amber-900 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle className="text-xl">Premium Feature</CardTitle>
              <CardDescription className="max-w-md mx-auto">
                Weak Topics Analysis is available for premium members only. 
                Upgrade to identify your weak areas and get personalized practice recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-8">
              <Button 
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                onClick={() => setShowSubscriptionModal(true)}
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Premium
              </Button>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="scheduled" className="mt-6">
        <SpacedRepetitionQueue upcomingPractice={upcomingPractice} userId={userId} />
      </TabsContent>

      <TabsContent value="streak" className="mt-6">
        <div className="grid gap-6 md:grid-cols-2">
          <StreakCard
            currentStreak={streakStats.currentStreak}
            longestStreak={streakStats.longestStreak}
            totalPracticeDays={streakStats.totalPracticeDays}
            streakStatus={streakStats.streakStatus}
            isActiveToday={streakStats.isActiveToday}
          />
          <PracticeCalendar calendarData={calendarData} />
        </div>
      </TabsContent>

      <TabsContent value="history" className="mt-6">
        <RevisionHistory revisionHistory={revisionHistory.map(item => ({
          ...item,
          title: item.title || 'Untitled Practice',
          totalQuestions: item.totalQuestions || 0
        }))} />
      </TabsContent>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        planId={null}
      />
    </Tabs>
  );
}