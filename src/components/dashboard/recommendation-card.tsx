/**
 * Recommendation Card Component
 * Individual recommendation display
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Recommendation, getRecommendationIcon } from '@/lib/dashboard/recommendations';
import { cn } from '@/lib/utils';

interface RecommendationCardProps {
  recommendation: Recommendation;
  index: number;
}

export function RecommendationCard({ recommendation, index }: RecommendationCardProps) {
  const icon = getRecommendationIcon(recommendation.type);

  return (
    <div
      className={cn(
        'flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-accent',
        recommendation.urgent && 'border-orange-300 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/20'
      )}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <span className="text-xl">{icon}</span>
      </div>
      
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-sm">
            {index}. {recommendation.title}
          </h4>
          {recommendation.urgent && (
            <Badge variant="destructive" className="text-xs">
              Urgent
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{recommendation.description}</p>
      </div>
      
      <Link href={recommendation.link}>
        <Button size="sm" variant={recommendation.urgent ? 'default' : 'outline'}>
          {recommendation.action} →
        </Button>
      </Link>
    </div>
  );
}
