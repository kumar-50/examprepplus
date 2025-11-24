/**
 * Recommendations Panel Component
 * Displays personalized action recommendations
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RecommendationCard } from './recommendation-card';
import { Recommendation } from '@/lib/dashboard/recommendations';

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
}

export function RecommendationsPanel({ recommendations }: RecommendationsPanelProps) {
  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">💡</span>
            Recommended for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-lg font-semibold mb-2">Great job!</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              You're making excellent progress. Keep practicing regularly to maintain your momentum.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">💡</span>
          Recommended for You
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec, index) => (
          <RecommendationCard
            key={rec.type}
            recommendation={rec}
            index={index + 1}
          />
        ))}
      </CardContent>
    </Card>
  );
}
