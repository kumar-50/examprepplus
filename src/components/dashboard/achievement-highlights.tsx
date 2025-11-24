import Link from 'next/link';
import { Trophy, Award, Star, Target, Zap, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { UnlockAchievementsButton } from './unlock-achievements-button';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  unlockedAt: Date;
}

interface NextAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  progress: number;
}

interface AchievementHighlightsProps {
  recentAchievements: Achievement[];
  nextAchievement: NextAchievement | null;
  totalPoints: number;
  perfectScores: number;
  testsCompleted?: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  trophy: Trophy,
  award: Award,
  star: Star,
  target: Target,
  zap: Zap,
};

/**
 * Achievement Highlights Card
 * Shows recently unlocked achievements, next achievement progress, and total points
 */
export function AchievementHighlights({
  recentAchievements,
  nextAchievement,
  totalPoints,
  perfectScores,
  testsCompleted = 0,
}: AchievementHighlightsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Achievement Highlights
            </CardTitle>
            <CardDescription>Your recent accomplishments</CardDescription>
          </div>
          <Badge variant="secondary" className="text-lg font-semibold">
            {totalPoints} pts
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Recent Achievements */}
        {recentAchievements.length > 0 ? (
          <div className="space-y-3">
            {recentAchievements.map((achievement) => {
              const Icon = iconMap[achievement.icon] || Trophy;
              
              return (
                <div
                  key={achievement.id}
                  className="flex items-center gap-3 p-3 border rounded-lg bg-gradient-to-r from-yellow-50/50 to-orange-50/50 dark:from-yellow-950/20 dark:to-orange-950/20"
                >
                  <div className="flex-shrink-0 h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{achievement.name}</h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {achievement.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Unlocked {formatDistanceToNow(new Date(achievement.unlockedAt), { addSuffix: true })}
                    </p>
                  </div>
                  
                  <Badge variant="outline" className="flex-shrink-0">
                    +{achievement.points}
                  </Badge>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground space-y-3">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No achievements unlocked yet</p>
            <p className="text-xs mt-1">Complete tests to start earning achievements!</p>
            <UnlockAchievementsButton 
              hasAchievements={false} 
              testsCompleted={testsCompleted}
              nextAchievementProgress={0}
            />
          </div>
        )}

        {/* Next Achievement Progress */}
        {nextAchievement && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Next Achievement</p>
              <span className="text-xs text-muted-foreground">{nextAchievement.progress}% complete</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
              {(() => {
                const Icon = iconMap[nextAchievement.icon] || Target;
                return (
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                );
              })()}
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{nextAchievement.name}</h4>
                <p className="text-xs text-muted-foreground truncate">
                  {nextAchievement.description}
                </p>
                
                {/* Progress bar */}
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${nextAchievement.progress}%` }}
                  />
                </div>
              </div>
              
              <Badge variant="secondary" className="flex-shrink-0">
                +{nextAchievement.points}
              </Badge>
            </div>
            
            {/* Show unlock button if next achievement is 100% */}
            {nextAchievement.progress >= 100 && (
              <div className="mt-3">
                <UnlockAchievementsButton 
                  hasAchievements={recentAchievements.length > 0} 
                  testsCompleted={testsCompleted}
                  nextAchievementProgress={nextAchievement.progress}
                />
              </div>
            )}
          </div>
        )}

        {/* Perfect Scores Badge */}
        {perfectScores > 0 && (
          <div className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <Star className="h-5 w-5 text-emerald-600 dark:text-emerald-500 fill-emerald-600 dark:fill-emerald-500" />
            <span className="text-sm font-medium">
              {perfectScores} Perfect Score{perfectScores > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* View All Link */}
        <div className="border-t pt-4">
          <Button variant="ghost" size="sm" className="w-full justify-between group" asChild>
            <Link href="/dashboard/progress">
              View All Achievements
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
