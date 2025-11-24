'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Achievement {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: string;
  isUnlocked: boolean;
  unlockedAt: Date | null;
  progress: {
    current: number;
    target: number;
    percentage: number;
  };
}

interface AchievementsGridProps {
  achievements: Achievement[];
  totalPoints: number;
  unlockedCount: number;
  totalCount: number;
}

export function AchievementsGrid({
  achievements,
  totalPoints,
  unlockedCount,
  totalCount,
}: AchievementsGridProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const unlockedAchievements = achievements.filter((a) => a.isUnlocked);
  const lockedAchievements = achievements.filter((a) => !a.isUnlocked);

  // Show top 6 unlocked and next 3 locked
  const displayedUnlocked = unlockedAchievements.slice(0, 6);
  const displayedLocked = lockedAchievements.slice(0, 3);
  
  // Group achievements by category for the modal
  const achievementsByCategory = {
    milestone: achievements.filter((a) => a.category === 'milestone'),
    performance: achievements.filter((a) => a.category === 'performance'),
    streak: achievements.filter((a) => a.category === 'streak'),
    coverage: achievements.filter((a) => a.category === 'coverage'),
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Achievements</CardTitle>
            <CardDescription>
              {unlockedCount} of {totalCount} unlocked • {totalPoints} points
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Unlocked Achievements */}
          {displayedUnlocked.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Unlocked</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {displayedUnlocked.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex flex-col items-center p-3 rounded-lg border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <div className="text-sm font-semibold text-center">
                      {achievement.name}
                    </div>
                    <div className="text-xs text-muted-foreground text-center mt-1">
                      {achievement.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Locked Achievements (In Progress) */}
          {displayedLocked.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">In Progress</h4>
              <div className="space-y-3">
                {displayedLocked.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center space-x-3 p-3 rounded-lg border bg-muted/30"
                  >
                    <div className="text-3xl opacity-40">{achievement.icon || '🏆'}</div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{achievement.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {achievement.description || ''}
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>
                            {achievement.progress.current} / {achievement.progress.target}
                          </span>
                          <span>{achievement.progress.percentage}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all duration-500"
                            style={{ width: `${achievement.progress.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* View All Link */}
          {(unlockedAchievements.length > 6 || lockedAchievements.length > 3) && (
            <div className="text-center">
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <button className="text-sm text-blue-600 hover:underline">
                    View All Achievements ({totalCount})
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>All Achievements</DialogTitle>
                    <DialogDescription>
                      {unlockedCount} of {totalCount} unlocked • {totalPoints} total points
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="milestone">Milestone</TabsTrigger>
                      <TabsTrigger value="performance">Performance</TabsTrigger>
                      <TabsTrigger value="streak">Streak</TabsTrigger>
                      <TabsTrigger value="coverage">Coverage</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="all" className="space-y-6 mt-4">
                      {/* Unlocked Section */}
                      {unlockedAchievements.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-3 text-green-600">
                            ✅ Unlocked ({unlockedAchievements.length})
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {unlockedAchievements.map((achievement) => (
                              <div
                                key={achievement.id}
                                className="flex flex-col items-center p-3 rounded-lg border bg-green-50 hover:shadow-md transition-shadow"
                              >
                                <div className="text-4xl mb-2">{achievement.icon}</div>
                                <div className="text-sm font-semibold text-center">
                                  {achievement.name}
                                </div>
                                <div className="text-xs text-muted-foreground text-center mt-1">
                                  {achievement.description}
                                </div>
                                {achievement.unlockedAt && (
                                  <div className="text-xs text-gray-500 mt-2">
                                    {new Date(achievement.unlockedAt).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Locked Section */}
                      {lockedAchievements.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-3 text-gray-600">
                            🔒 Locked ({lockedAchievements.length})
                          </h4>
                          <div className="grid gap-3">
                            {lockedAchievements.map((achievement) => (
                              <div
                                key={achievement.id}
                                className="flex items-center space-x-3 p-3 rounded-lg border bg-muted/30"
                              >
                                <div className="text-3xl opacity-40">{achievement.icon || '🏆'}</div>
                                <div className="flex-1">
                                  <div className="text-sm font-semibold">{achievement.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {achievement.description || ''}
                                  </div>
                                  <div className="mt-2 space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span>
                                        {achievement.progress.current} / {achievement.progress.target}
                                      </span>
                                      <span>{achievement.progress.percentage}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-blue-500 transition-all duration-500"
                                        style={{ width: `${achievement.progress.percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </TabsContent>
                    
                    {/* Category-specific tabs */}
                    {(['milestone', 'performance', 'streak', 'coverage'] as const).map((category) => (
                      <TabsContent key={category} value={category} className="space-y-4 mt-4">
                        {achievementsByCategory[category].length === 0 ? (
                          <p className="text-center text-muted-foreground py-8">
                            No achievements in this category
                          </p>
                        ) : (
                          <div className="grid gap-3">
                            {achievementsByCategory[category].map((achievement) => (
                              <div
                                key={achievement.id}
                                className={`flex items-center space-x-3 p-3 rounded-lg border ${
                                  achievement.isUnlocked ? 'bg-green-50' : 'bg-muted/30'
                                }`}
                              >
                                <div className={`text-3xl ${!achievement.isUnlocked && 'opacity-40'}`}>
                                  {achievement.icon || '🏆'}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <div className="text-sm font-semibold">{achievement.name}</div>
                                    {achievement.isUnlocked && <span className="text-green-600">✅</span>}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {achievement.description || ''}
                                  </div>
                                  {!achievement.isUnlocked && (
                                    <div className="mt-2 space-y-1">
                                      <div className="flex justify-between text-xs">
                                        <span>
                                          {achievement.progress.current} / {achievement.progress.target}
                                        </span>
                                        <span>{achievement.progress.percentage}%</span>
                                      </div>
                                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-blue-500 transition-all duration-500"
                                          style={{ width: `${achievement.progress.percentage}%` }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                  {achievement.isUnlocked && achievement.unlockedAt && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>
                    ))}
                  </Tabs>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
