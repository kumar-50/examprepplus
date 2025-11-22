/**
 * Difficulty Analysis Component
 * 
 * Donut chart showing performance breakdown by difficulty level
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Pie, PieChart, Cell, Legend, ResponsiveContainer } from 'recharts';
import type { DifficultyBreakdown } from '@/lib/analytics/types';

interface DifficultyAnalysisProps {
  data: DifficultyBreakdown[];
}

const COLORS = {
  easy: 'hsl(142, 76%, 36%)',    // green-600
  medium: 'hsl(38, 92%, 50%)',   // orange-500
  hard: 'hsl(0, 84%, 60%)',      // red-500
};

const chartConfig = {
  easy: {
    label: 'Easy',
    color: COLORS.easy,
  },
  medium: {
    label: 'Medium',
    color: COLORS.medium,
  },
  hard: {
    label: 'Hard',
    color: COLORS.hard,
  },
};

export function DifficultyAnalysisChart({ data }: DifficultyAnalysisProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Difficulty Analysis</CardTitle>
          <CardDescription>Performance by question difficulty</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex flex-col items-center justify-center text-center">
            <div className="text-5xl mb-4">📊</div>
            <p className="text-muted-foreground">No difficulty data available yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Answer questions to see your performance analysis!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = data.map(item => ({
    name: item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1),
    value: item.attempted,
    accuracy: item.accuracy,
    correct: item.correct,
    difficulty: item.difficulty,
  }));

  const totalAttempted = data.reduce((sum, d) => sum + d.attempted, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Difficulty Analysis</CardTitle>
        <CardDescription>
          {totalAttempted} questions attempted across difficulty levels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.difficulty as keyof typeof COLORS]} 
                  />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                formatter={(value: string, entry: any) => {
                  const item = entry.payload;
                  return `${value} (${item.accuracy}% accurate)`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Performance Grid */}
        <div className="mt-6 pt-4 border-t space-y-3">
          {data.map((item) => {
            const percentage = totalAttempted > 0 ? Math.round((item.attempted / totalAttempted) * 100) : 0;
            const color = COLORS[item.difficulty as keyof typeof COLORS];
            
            return (
              <div key={item.difficulty} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-medium capitalize">{item.difficulty}</span>
                  </div>
                  <div className="text-muted-foreground">
                    {item.correct}/{item.attempted} ({item.accuracy}%)
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-500"
                    style={{ 
                      width: `${item.accuracy}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
                
                <p className="text-xs text-muted-foreground">
                  {percentage}% of total questions attempted
                </p>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-4 border-t grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{totalAttempted}</p>
            <p className="text-xs text-muted-foreground">Total Attempted</p>
          </div>
          <div>
            <p className="text-2xl font-bold">
              {data.length > 0 
                ? Math.round(data.reduce((sum, d) => sum + d.correct, 0) / totalAttempted * 100)
                : 0}%
            </p>
            <p className="text-xs text-muted-foreground">Overall Accuracy</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
