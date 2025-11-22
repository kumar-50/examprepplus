/**
 * Analytics Dashboard Client Component
 * 
 * Handles client-side interactivity for analytics
 */

'use client';

import { useState } from 'react';
import { OverviewCards } from '@/components/analytics/overview-cards';
import { AccuracyChart } from '@/components/analytics/accuracy-chart';
import { SectionPerformanceChart } from '@/components/analytics/section-performance';
import { TestTypeComparisonChart } from '@/components/analytics/test-type-comparison';
import { ActivityHeatmap } from '@/components/analytics/activity-heatmap';
import { DifficultyAnalysisChart } from '@/components/analytics/difficulty-analysis';
import { TimeAnalysisChart } from '@/components/analytics/time-analysis';
import { LearningInsightsPanel } from '@/components/analytics/learning-insights';
import { ExportMenu } from '@/components/analytics/export-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
  OverviewStats,
  AccuracyDataPoint,
  SectionPerformance,
  TestTypeComparison,
  ActivityData,
  DifficultyBreakdown,
  HourPerformance,
  DayOfWeekPerformance,
  BestPerformanceTime,
  Insight,
  DateRange,
} from '@/lib/analytics/types';

interface AnalyticsClientProps {
  initialData: {
    overview: OverviewStats;
    accuracyTrend: AccuracyDataPoint[];
    sectionPerformance: SectionPerformance[];
    testTypeComparison: TestTypeComparison[];
    activityData: ActivityData[];
    difficultyData: DifficultyBreakdown[];
    timeData: {
      hourPerformance: HourPerformance[];
      dayOfWeekPerformance: DayOfWeekPerformance[];
      bestTime: BestPerformanceTime | null;
    };
    insights: Insight[];
  };
}

export function AnalyticsClient({ initialData }: AnalyticsClientProps) {
  const [dateRange, setDateRange] = useState<DateRange['preset']>('30d');

  return (
    <>
      {/* Header with Export */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track your performance, identify patterns, and measure your progress
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportMenu
            data={{
              overview: initialData.overview,
              accuracyTrend: initialData.accuracyTrend,
              sectionPerformance: initialData.sectionPerformance,
              testTypeComparison: initialData.testTypeComparison,
              difficultyBreakdown: initialData.difficultyData,
            }}
          />
        </div>
      </div>

      {/* Date Range Tabs */}
      <Tabs value={dateRange} onValueChange={(value) => setDateRange(value as DateRange['preset'])}>
        <TabsList>
          <TabsTrigger value="7d">Last 7 days</TabsTrigger>
          <TabsTrigger value="30d">Last 30 days</TabsTrigger>
          <TabsTrigger value="90d">Last 90 days</TabsTrigger>
          <TabsTrigger value="all">All time</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Overview Cards */}
      <OverviewCards stats={initialData.overview} />

      {/* Learning Insights - Featured */}
      <LearningInsightsPanel insights={initialData.insights} />

      {/* Accuracy Chart - Full Width */}
      <AccuracyChart data={initialData.accuracyTrend} />

      {/* Section Performance - Full Width */}
      <SectionPerformanceChart data={initialData.sectionPerformance} />

      {/* Two Column Layout - Test Type & Difficulty */}
      <div className="grid gap-6 md:grid-cols-2">
        <TestTypeComparisonChart data={initialData.testTypeComparison} />
        <DifficultyAnalysisChart data={initialData.difficultyData} />
      </div>

      {/* Time Analysis - Full Width */}
      <TimeAnalysisChart
        hourPerformance={initialData.timeData.hourPerformance}
        dayOfWeekPerformance={initialData.timeData.dayOfWeekPerformance}
        bestTime={initialData.timeData.bestTime}
      />

      {/* Activity Heatmap - Full Width */}
      <ActivityHeatmap data={initialData.activityData} />
    </>
  );
}
