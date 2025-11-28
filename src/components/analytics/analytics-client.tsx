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
import { useAccessControl } from '@/hooks/use-access-control';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Crown } from 'lucide-react';
import { SubscriptionModal } from '@/components/subscription/subscription-modal';
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
  const [dateRange, setDateRange] = useState<DateRange['preset']>('7d');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { isPremium, loading: accessLoading } = useAccessControl();

  // Date range options based on subscription
  const availableDateRanges = isPremium 
    ? ['7d', '30d', '90d', 'all'] 
    : ['7d'];  // Free users only get 7 days

  // Limit insights for free users (2 max)
  const displayedInsights = isPremium 
    ? initialData.insights 
    : initialData.insights.slice(0, 2);
  
  const hiddenInsightsCount = initialData.insights.length - displayedInsights.length;

  // Limit activity heatmap for free users (30 days)
  const displayedActivityData = isPremium
    ? initialData.activityData
    : initialData.activityData.slice(-30);

  // Premium feature placeholder card
  const PremiumFeatureCard = ({ title, description, icon }: { title: string; description: string; icon?: React.ReactNode }) => (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-muted-foreground" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          {icon || <Crown className="w-12 h-12 text-primary/40 mb-4" />}
          <p className="text-muted-foreground mb-4">
            Upgrade to Premium to unlock this feature
          </p>
          <Button onClick={() => setShowSubscriptionModal(true)} size="sm">
            <Crown className="w-4 h-4 mr-2" />
            Upgrade Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );

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
          {isPremium ? (
            <ExportMenu
              data={{
                overview: initialData.overview,
                accuracyTrend: initialData.accuracyTrend,
                sectionPerformance: initialData.sectionPerformance,
                testTypeComparison: initialData.testTypeComparison,
                difficultyBreakdown: initialData.difficultyData,
              }}
            />
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowSubscriptionModal(true)}
              className="gap-2"
            >
              <Lock className="w-4 h-4" />
              Export
              <Crown className="w-3 h-3 text-primary" />
            </Button>
          )}
        </div>
      </div>

      {/* Date Range Tabs */}
      <Tabs value={dateRange} onValueChange={(value) => setDateRange(value as DateRange['preset'])}>
        <TabsList>
          <TabsTrigger value="7d">Last 7 days</TabsTrigger>
          <TabsTrigger 
            value="30d" 
            disabled={!isPremium}
            className={!isPremium ? 'opacity-50' : ''}
          >
            Last 30 days
            {!isPremium && <Lock className="w-3 h-3 ml-1" />}
          </TabsTrigger>
          <TabsTrigger 
            value="90d" 
            disabled={!isPremium}
            className={!isPremium ? 'opacity-50' : ''}
          >
            Last 90 days
            {!isPremium && <Lock className="w-3 h-3 ml-1" />}
          </TabsTrigger>
          <TabsTrigger 
            value="all" 
            disabled={!isPremium}
            className={!isPremium ? 'opacity-50' : ''}
          >
            All time
            {!isPremium && <Lock className="w-3 h-3 ml-1" />}
          </TabsTrigger>
        </TabsList>
        {!isPremium && (
          <p className="text-xs text-muted-foreground mt-2">
            <Button 
              variant="link" 
              className="h-auto p-0 text-xs text-primary"
              onClick={() => setShowSubscriptionModal(true)}
            >
              Upgrade to Premium
            </Button>
            {' '}to unlock extended date ranges
          </p>
        )}
      </Tabs>

      {/* Overview Cards */}
      <OverviewCards stats={initialData.overview} />

      {/* Learning Insights - with limit for free users */}
      <LearningInsightsPanel 
        insights={displayedInsights} 
        hiddenCount={hiddenInsightsCount}
        onUpgradeClick={() => setShowSubscriptionModal(true)}
      />

      {/* Accuracy Chart - Full Width */}
      <AccuracyChart data={initialData.accuracyTrend} />

      {/* Section Performance - Full Width */}
      <SectionPerformanceChart data={initialData.sectionPerformance} />

      {/* Two Column Layout - Test Type & Difficulty */}
      <div className="grid gap-6 md:grid-cols-2">
        <TestTypeComparisonChart data={initialData.testTypeComparison} />
        <DifficultyAnalysisChart data={initialData.difficultyData} />
      </div>

      {/* Time Analysis - Premium Only */}
      {isPremium ? (
        <TimeAnalysisChart
          hourPerformance={initialData.timeData.hourPerformance}
          dayOfWeekPerformance={initialData.timeData.dayOfWeekPerformance}
          bestTime={initialData.timeData.bestTime}
        />
      ) : (
        <PremiumFeatureCard 
          title="Time Analysis"
          description="Discover your peak performance times and optimal study schedule"
          icon={<span className="text-5xl mb-4">⏰</span>}
        />
      )}

      {/* Activity Heatmap - Limited for free users */}
      <ActivityHeatmap 
        data={displayedActivityData} 
        limitedDays={!isPremium ? 30 : undefined}
        onUpgradeClick={() => setShowSubscriptionModal(true)}
      />

      {/* Subscription Modal */}
      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)}
        planId={null}
      />
    </>
  );
}
