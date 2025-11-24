'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { format, addDays, addWeeks } from 'date-fns';

interface Section {
  id: string;
  name: string;
}

interface CreateGoalDialogProps {
  sections?: Section[];
  onGoalCreated?: (() => void | Promise<void>) | undefined;
}

export function CreateGoalDialog({ sections = [], onGoalCreated }: CreateGoalDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    goalType: 'daily',
    goalCategory: 'questions',
    targetValue: '50',
    sectionId: 'all',
  });

  const goalCategories = [
    { value: 'questions', label: 'Questions', icon: '❓', description: 'Number of questions to answer' },
    { value: 'tests', label: 'Tests', icon: '📝', description: 'Number of tests to complete' },
    { value: 'streak', label: 'Streak', icon: '🔥', description: 'Consecutive study days' },
  ];

  const goalTypes = [
    { value: 'daily', label: 'Daily', description: 'Resets every day' },
    { value: 'weekly', label: 'Weekly', description: 'Resets every week' },
    { value: 'monthly', label: 'Monthly', description: 'Resets every month' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const today = new Date();
      let periodStart = format(today, 'yyyy-MM-dd');
      let periodEnd = format(today, 'yyyy-MM-dd');

      // Calculate period based on goal type and category
      if (formData.goalType === 'daily') {
        periodEnd = format(today, 'yyyy-MM-dd');
      } else if (formData.goalType === 'weekly') {
        periodEnd = format(addWeeks(today, 1), 'yyyy-MM-dd');
      } else if (formData.goalType === 'monthly') {
        // Monthly: 30 days period
        periodEnd = format(addDays(today, 30), 'yyyy-MM-dd');
      }

      // Validate logical constraints
      if (formData.goalCategory === 'streak') {
        const targetDays = parseInt(formData.targetValue);
        const startDate = new Date(periodStart);
        const endDate = new Date(periodEnd);
        const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (targetDays > periodDays) {
          alert(`Cannot achieve ${targetDays}-day streak in ${periodDays}-day period. Please select "Monthly" goal type for long streaks.`);
          setLoading(false);
          return;
        }
      }

      const response = await fetch('/api/progress/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalType: formData.goalType,
          goalCategory: formData.goalCategory,
          targetValue: formData.targetValue,
          periodStart,
          periodEnd,
          sectionId: formData.sectionId === 'all' ? null : formData.sectionId,
        }),
      });

      if (!response.ok) throw new Error('Failed to create goal');

      setOpen(false);
      setFormData({
        goalType: 'daily',
        goalCategory: 'questions',
        targetValue: '50',
        sectionId: 'all',
      });
      onGoalCreated?.();
    } catch (error) {
      console.error('Error creating goal:', error);
      alert('Failed to create goal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = goalCategories.find((c) => c.value === formData.goalCategory);
  const isAccuracyGoal = formData.goalCategory === 'accuracy';
  const isStreakGoal = formData.goalCategory === 'streak';

  /**
   * LOGIC MATRIX: Max realistic values based on goal type and category
   * 
   * Category     | Daily Max | Weekly Max | Monthly Max | Reasoning
   * -------------|-----------|------------|-------------|---------------------------
   * Questions    | 200       | 1400       | 6000        | ~200 questions/day is realistic
   * Tests        | 5         | 35         | 150         | ~5 tests/day max
   * Streak       | 1         | 7          | 30          | Can't exceed period days
   */
  const getMaxValue = () => {
    const maxValues: Record<string, { daily: number; weekly: number; monthly: number }> = {
      questions: { daily: 200, weekly: 1400, monthly: 6000 },
      tests: { daily: 5, weekly: 35, monthly: 150 },
      streak: { daily: 1, weekly: 7, monthly: 30 },
    };

    const config = maxValues[formData.goalCategory] || { daily: 50, weekly: 350, monthly: 1500 };
    
    if (formData.goalType === 'daily') return config.daily;
    if (formData.goalType === 'weekly') return config.weekly;
    return config.monthly;
  };

  const getDefaultValue = () => {
    const defaults: Record<string, { daily: number; weekly: number; monthly: number }> = {
      questions: { daily: 50, weekly: 300, monthly: 3000 },
      tests: { daily: 2, weekly: 10, monthly: 50 },
      streak: { daily: 1, weekly: 5, monthly: 15 },
    };

    const config = defaults[formData.goalCategory] || { daily: 10, weekly: 50, monthly: 500 };
    
    if (formData.goalType === 'daily') return config.daily;
    if (formData.goalType === 'weekly') return config.weekly;
    return config.monthly;
  };

  const getStepValue = () => {
    if (isStreakGoal) return 1;
    if (formData.goalCategory === 'tests') return 1;
    return formData.goalType === 'daily' ? 5 : 10; // Larger steps for questions
  };

  const maxValue = getMaxValue();
  const defaultValue = getDefaultValue();
  const stepValue = getStepValue();

  // Adjust target value if it exceeds new max when changing goal type/category
  if (parseInt(formData.targetValue) > maxValue) {
    setFormData({ ...formData, targetValue: defaultValue.toString() });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Set Goal
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto w-full sm:max-w-[540px] p-0">
        <SheetHeader className="space-y-2 sm:space-y-3 px-4 sm:px-6 pt-6">
          <SheetTitle className="text-xl sm:text-2xl">Create Study Goal</SheetTitle>
          <SheetDescription className="text-sm sm:text-base">Set a target to track your progress and stay motivated</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col h-[calc(100vh-140px)]">
          <div className="space-y-4 sm:space-y-6 py-4 sm:py-6 px-4 sm:px-6 flex-1 overflow-y-auto">
            {/* Goal Type */}
            <div className="space-y-2 sm:space-y-3">
              <Label className="text-sm sm:text-base font-semibold">Goal Type</Label>
              <Tabs value={formData.goalType} onValueChange={(value) => setFormData({ ...formData, goalType: value })} className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-9 sm:h-10">
                  {goalTypes.map((type) => (
                    <TabsTrigger key={type.value} value={type.value} className="text-xs sm:text-sm">
                      {type.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Goal Category */}
            <div className="space-y-2 sm:space-y-3">
              <Label className="text-sm sm:text-base font-semibold">What to Track</Label>
              <Tabs value={formData.goalCategory} onValueChange={(value) => setFormData({ ...formData, goalCategory: value })} className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-9 sm:h-10">
                  {goalCategories.map((category) => (
                    <TabsTrigger key={category.value} value={category.value} className="text-xs sm:text-sm">
                      {category.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Smart tip based on category and type */}
            {formData.goalCategory === 'tests' && formData.goalType === 'daily' && parseInt(formData.targetValue) > 3 && (
                <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3">
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    💡 <strong>Tip:</strong> {formData.targetValue} tests per day is very ambitious. Average is 2-3 tests daily.
                  </p>
                </div>
              )}
            {isStreakGoal && formData.goalType !== 'monthly' && (
              <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  💡 <strong>Tip:</strong> For streaks longer than {formData.goalType === 'daily' ? '1 day' : '7 days'}, 
                  use <strong>Monthly</strong> goal type.
                </p>
              </div>
            )}

            {/* Target Value */}
            <div className="space-y-3 sm:space-y-4 rounded-lg border p-3 sm:p-5 bg-muted/30 w-full">
              <div className="flex items-center justify-between w-full">
                <Label htmlFor="targetValue" className="text-sm sm:text-base font-semibold">
                  Target
                </Label>
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="text-3xl sm:text-4xl font-bold text-primary tabular-nums">
                    {formData.targetValue || defaultValue}
                  </span>
                  {isStreakGoal && <span className="text-base sm:text-lg font-medium text-muted-foreground">days</span>}
                </div>
              </div>
              <div className="px-1 py-2 sm:py-3 w-full">
                <Slider
                  id="targetValue"
                  min={1}
                  max={maxValue}
                  step={stepValue}
                  value={[parseInt(formData.targetValue) || defaultValue]}
                  onValueChange={(value) => setFormData({ ...formData, targetValue: (value[0] || 1).toString() })}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-xs sm:text-sm text-muted-foreground font-medium px-1 w-full">
                <span>1</span>
                <span>{maxValue}</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground text-center w-full">
                {isStreakGoal 
                  ? `Max ${maxValue} days for ${formData.goalType} goal`
                  : `Realistic max: ${maxValue} ${formData.goalCategory} per ${formData.goalType === 'daily' ? 'day' : formData.goalType === 'weekly' ? 'week' : 'month'}`}
              </p>
            </div>

            {/* Preview */}
            <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-3 sm:p-5 space-y-1 sm:space-y-2 w-full">
              <p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">Goal Preview</p>
              <p className="text-base sm:text-lg w-full">
                <span className="text-muted-foreground">
                  {formData.goalType === 'daily' ? 'Daily' : formData.goalType === 'weekly' ? 'Weekly' : 'Monthly'} goal:{' '}
                </span>
                <span className="font-bold text-foreground">
                  {formData.targetValue} {selectedCategory?.label.toLowerCase()}
                </span>
              </p>
            </div>
          </div>
          <SheetFooter className="gap-2 px-4 sm:px-6 py-3 sm:py-4 border-t bg-background sticky bottom-0 w-full flex-row">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading} className="flex-1 h-10 sm:h-11 text-sm sm:text-base">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 h-10 sm:h-11 text-sm sm:text-base">
              {loading ? 'Creating...' : 'Create Goal'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
