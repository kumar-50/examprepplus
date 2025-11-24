'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ImprovementMetricsProps {
  thisMonth: {
    accuracy: number;
    testsCompleted: number;
    currentStreak: number;
  };
  lastMonth: {
    accuracy: number;
    testsCompleted: number;
    currentStreak: number;
  };
  mostImprovedSections: Array<{
    sectionName: string;
    previousAccuracy: number;
    currentAccuracy: number;
    improvement: number;
  }>;
  consistencyScore: number;
}

export function ImprovementMetrics({
  thisMonth,
  lastMonth,
  mostImprovedSections,
  consistencyScore,
}: ImprovementMetricsProps) {
  const getChangeIcon = (current: number, previous: number) => {
    if (current > previous) return '↗️';
    if (current < previous) return '↘️';
    return '→';
  };

  const getChangeColor = (current: number, previous: number) => {
    if (current > previous) return 'text-green-600';
    if (current < previous) return 'text-red-600';
    return 'text-gray-600';
  };

  const accuracyChange = thisMonth.accuracy - lastMonth.accuracy;
  const testsChange = thisMonth.testsCompleted - lastMonth.testsCompleted;
  const streakChange = thisMonth.currentStreak - lastMonth.currentStreak;

  return (
    <Card>
      <CardHeader>
        <CardTitle>This Month&apos;s Improvements</CardTitle>
        <CardDescription>Compare your progress with last month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getChangeColor(thisMonth.accuracy, lastMonth.accuracy)}`}>
                {thisMonth.accuracy.toFixed(0)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">Accuracy</div>
              <div className={`text-sm mt-1 ${getChangeColor(thisMonth.accuracy, lastMonth.accuracy)}`}>
                {accuracyChange >= 0 ? '+' : ''}
                {accuracyChange.toFixed(0)}% {getChangeIcon(thisMonth.accuracy, lastMonth.accuracy)}
              </div>
            </div>

            <div className="text-center">
              <div className={`text-2xl font-bold ${getChangeColor(thisMonth.testsCompleted, lastMonth.testsCompleted)}`}>
                {thisMonth.testsCompleted}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Tests</div>
              <div className={`text-sm mt-1 ${getChangeColor(thisMonth.testsCompleted, lastMonth.testsCompleted)}`}>
                {testsChange >= 0 ? '+' : ''}
                {testsChange} {getChangeIcon(thisMonth.testsCompleted, lastMonth.testsCompleted)}
              </div>
            </div>

            <div className="text-center">
              <div className={`text-2xl font-bold ${getChangeColor(thisMonth.currentStreak, lastMonth.currentStreak)}`}>
                {thisMonth.currentStreak}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Streak</div>
              <div className={`text-sm mt-1 ${getChangeColor(thisMonth.currentStreak, lastMonth.currentStreak)}`}>
                {streakChange >= 0 ? '+' : ''}
                {streakChange} {getChangeIcon(thisMonth.currentStreak, lastMonth.currentStreak)}
              </div>
            </div>
          </div>

          {/* Most Improved Sections */}
          {mostImprovedSections.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-3">Most Improved Sections</h4>
              <div className="space-y-2">
                {mostImprovedSections.slice(0, 3).map((section, index) => (
                  <div key={section.sectionName} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">📈</span>
                      <div>
                        <p className="text-sm font-medium">{section.sectionName}</p>
                        <p className="text-xs text-muted-foreground">
                          {section.previousAccuracy.toFixed(0)}% → {section.currentAccuracy.toFixed(0)}%
                        </p>
                      </div>
                    </div>
                    <div className="text-green-600 font-semibold text-sm">
                      +{section.improvement.toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Consistency Score */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold">Consistency Score</span>
              <span className="text-sm font-bold">{consistencyScore.toFixed(1)}/10</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                style={{ width: `${consistencyScore * 10}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Based on your study regularity and pattern
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
