'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateGoalDialog } from './create-goal-dialog';
import { Button } from '@/components/ui/button';
import { Trash2, Check, Crown, Lock } from 'lucide-react';
import { useState } from 'react';

interface Goal {
  id: string;
  goalType: string;
  goalCategory: string;
  targetValue: string;
  currentValue: string;
  periodStart: string | Date;
  periodEnd: string | Date;
  status: string;
  sectionId?: string | null;
}

interface Section {
  id: string;
  name: string;
}

interface GoalsDashboardProps {
  goals: Goal[];
  todayGoals: Goal[];
  sections?: Section[];
  onGoalChanged?: () => void | Promise<void>;
  isPremium?: boolean;
  onUpgradeClick?: () => void;
}

export function GoalsDashboard({ goals, todayGoals, sections = [], onGoalChanged, isPremium = true, onUpgradeClick }: GoalsDashboardProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  
  // Free users can only have 1 active goal
  const activeGoalsCount = goals.filter(g => g.status === 'active').length;
  const canCreateGoal = isPremium || activeGoalsCount < 1;
  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    
    setDeletingId(goalId);
    try {
      const response = await fetch(`/api/progress/goals/${goalId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete goal');
      
      onGoalChanged?.();
    } catch (error) {
      console.error('Error deleting goal:', error);
      alert('Failed to delete goal. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCompleteGoal = async (goalId: string) => {
    setCompletingId(goalId);
    try {
      const response = await fetch(`/api/progress/goals/${goalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });

      if (!response.ok) throw new Error('Failed to complete goal');
      
      onGoalChanged?.();
    } catch (error) {
      console.error('Error completing goal:', error);
      alert('Failed to complete goal. Please try again.');
    } finally {
      setCompletingId(null);
    }
  };

  const getProgressPercentage = (current: string, target: string) => {
    const currentNum = parseFloat(current);
    const targetNum = parseFloat(target);
    return Math.min(Math.round((currentNum / targetNum) * 100), 100);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'questions':
        return '❓';
      case 'accuracy':
        return '🎯';
      case 'time':
        return '⏱️';
      case 'tests':
        return '📝';
      case 'sections':
        return '📚';
      case 'streak':
        return '🔥';
      default:
        return '✨';
    }
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 100) return '✅';
    if (percentage >= 50) return '🔄';
    return '❌';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Today&apos;s Goals</CardTitle>
            <CardDescription>Track your daily study targets</CardDescription>
          </div>
          {canCreateGoal ? (
            <CreateGoalDialog sections={sections} onGoalCreated={onGoalChanged} />
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onUpgradeClick}
              className="gap-2"
            >
              <Lock className="w-4 h-4" />
              Add Goal
              <Crown className="w-3 h-3 text-primary" />
            </Button>
          )}
        </div>
        {!isPremium && activeGoalsCount >= 1 && (
          <p className="text-xs text-muted-foreground mt-2">
            Free users can have 1 active goal. 
            <Button 
              variant="link" 
              className="h-auto p-0 text-xs text-primary ml-1"
              onClick={onUpgradeClick}
            >
              Upgrade for unlimited goals
            </Button>
          </p>
        )}
      </CardHeader>
      <CardContent>
        {todayGoals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-2">No goals set for today</p>
            <p className="text-sm">Create your first goal to start tracking progress</p>
          </div>
        ) : (
          <div className="space-y-4">
            {todayGoals.map((goal) => {
              const percentage = getProgressPercentage(goal.currentValue, goal.targetValue);
              const icon = getCategoryIcon(goal.goalCategory);
              const statusIcon = getStatusIcon(percentage);

              return (
                <div key={goal.id} className="space-y-2 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{icon}</span>
                      <div>
                        <p className="text-sm font-medium capitalize">
                          {goal.goalCategory.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {goal.currentValue} / {goal.targetValue}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{statusIcon}</span>
                      <span className="text-sm font-semibold">{percentage}%</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {percentage >= 100 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={() => handleCompleteGoal(goal.id)}
                            disabled={completingId === goal.id}
                            title="Mark as completed"
                          >
                            <Check className="h-3 w-3 text-green-600" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => handleDeleteGoal(goal.id)}
                          disabled={deletingId === goal.id}
                          title="Delete goal"
                        >
                          <Trash2 className="h-3 w-3 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        percentage >= 100
                          ? 'bg-green-500'
                          : percentage >= 50
                          ? 'bg-blue-500'
                          : 'bg-yellow-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Weekly Goals Preview */}
        {goals.filter((g) => g.goalType === 'weekly').length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="text-sm font-semibold mb-3">Weekly Goals</h4>
            <div className="space-y-3">
              {goals
                .filter((g) => g.goalType === 'weekly')
                .slice(0, 3)
                .map((goal) => {
                  const percentage = getProgressPercentage(goal.currentValue, goal.targetValue);
                  return (
                    <div key={goal.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground capitalize">
                        {goal.goalCategory.replace('_', ' ')}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {goal.currentValue}/{goal.targetValue}
                        </span>
                        <span className="text-xs text-muted-foreground">({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
