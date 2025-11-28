'use client';

import { useState } from 'react';
import { ExamReadinessCard } from './exam-readiness-card';
import { StreakCalendar } from './streak-calendar';
import { GoalsDashboard } from './goals-dashboard';
import { AchievementsGrid } from './achievements-grid';
import { SectionCoverageMap } from './section-coverage-map';
import { ImprovementMetrics } from './improvement-metrics';
import { useAccessControl } from '@/hooks/use-access-control';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Crown } from 'lucide-react';
import { SubscriptionModal } from '@/components/subscription/subscription-modal';

interface ProgressPageClientProps {
  initialData: {
    readiness: any;
    streak: any;
    goals: any[];
    achievements: any;
    sectionCoverageData: any[];
    todayGoals: any[];
    improvementMetrics: any;
    sections: any[];
  };
  onRefresh: () => Promise<void>;
}

export function ProgressPageClient({ initialData, onRefresh }: ProgressPageClientProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { isPremium, loading: accessLoading } = useAccessControl();

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const {
    readiness,
    streak,
    goals,
    achievements,
    sectionCoverageData,
    todayGoals,
    improvementMetrics,
    sections,
  } = initialData;

  // Limit section coverage for free users (top 3 only)
  const displayedSections = isPremium 
    ? sectionCoverageData 
    : sectionCoverageData.slice(0, 3);
  const hiddenSectionsCount = sectionCoverageData.length - displayedSections.length;

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
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Progress Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Track your exam readiness and celebrate your achievements
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Row 1: Readiness and Streak */}
        <div className="lg:col-span-2">
          {readiness ? (
            <ExamReadinessCard 
              readiness={readiness} 
              showFullBreakdown={isPremium}
              onUpgradeClick={() => setShowSubscriptionModal(true)}
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Complete some tests to see your readiness score</p>
            </div>
          )}
        </div>

        <div>
          {streak ? (
            <StreakCalendar streakData={streak} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Start practicing to build your streak</p>
            </div>
          )}
        </div>

        {/* Row 2: Goals */}
        <div className="lg:col-span-3">
          <GoalsDashboard
            goals={goals}
            todayGoals={todayGoals}
            sections={sections}
            onGoalChanged={handleRefresh}
            isPremium={isPremium}
            onUpgradeClick={() => setShowSubscriptionModal(true)}
          />
        </div>

        {/* Row 3: Achievements and Section Coverage */}
        <div className="lg:col-span-2">
          {achievements ? (
            <AchievementsGrid
              achievements={achievements.achievements}
              totalPoints={achievements.totalPoints}
              unlockedCount={achievements.unlockedCount}
              totalCount={achievements.totalCount}
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Achievements loading...</p>
            </div>
          )}
        </div>

        <div>
          {displayedSections.length > 0 ? (
            <SectionCoverageMap 
              sections={displayedSections}
              hiddenCount={hiddenSectionsCount}
              onUpgradeClick={() => setShowSubscriptionModal(true)} 
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Practice to see section coverage</p>
            </div>
          )}
        </div>

        {/* Row 4: Improvement Metrics - Premium Only */}
        <div className="lg:col-span-3">
          {isPremium ? (
            <ImprovementMetrics {...improvementMetrics} />
          ) : (
            <PremiumFeatureCard 
              title="Improvement Metrics"
              description="Track your month-over-month progress"
              icon={<span className="text-5xl mb-4">📈</span>}
            />
          )}
        </div>
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)}
        planId={null}
      />
    </div>
  );
}
