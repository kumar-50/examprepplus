'use client';

import { useState } from 'react';
import { ExamReadinessCard } from './exam-readiness-card';
import { StreakCalendar } from './streak-calendar';
import { GoalsDashboard } from './goals-dashboard';
import { AchievementsGrid } from './achievements-grid';
import { SectionCoverageMap } from './section-coverage-map';
import { ImprovementMetrics } from './improvement-metrics';

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
            <ExamReadinessCard readiness={readiness} />
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
          {sectionCoverageData.length > 0 ? (
            <SectionCoverageMap sections={sectionCoverageData} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Practice to see section coverage</p>
            </div>
          )}
        </div>

        {/* Row 4: Improvement Metrics */}
        <div className="lg:col-span-3">
          <ImprovementMetrics {...improvementMetrics} />
        </div>
      </div>
    </div>
  );
}
