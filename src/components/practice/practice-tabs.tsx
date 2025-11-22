'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WeakTopicsSection } from '@/components/practice/weak-topics-section';
import { SpacedRepetitionQueue } from '@/components/practice/spaced-repetition-queue';
import { RevisionHistory } from '@/components/practice/revision-history';
import { StreakCard } from '@/components/practice/streak-card';
import { PracticeCalendar } from '@/components/practice/practice-calendar';
import { Brain, History, Clock, Flame } from 'lucide-react';

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
  console.log('🎯 PracticeTabs props:', {
    weakTopicsCount: weakTopics?.length ?? 'undefined',
    upcomingCount: upcomingPractice?.length ?? 'undefined',
    historyCount: revisionHistory?.length ?? 'undefined',
    userId
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
        <WeakTopicsSection weakTopics={weakTopics} userId={userId} />
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
    </Tabs>
  );
}