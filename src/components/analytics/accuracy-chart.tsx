/**
 * Accuracy Chart Component
 * 
 * Area chart showing accuracy trend over time with shadcn/ui charts
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ChartConfig, 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { AccuracyDataPoint } from '@/lib/analytics/types';
import { format } from 'date-fns';

interface AccuracyChartProps {
  data: AccuracyDataPoint[];
}

const chartConfig = {
  accuracy: {
    label: 'Accuracy',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export function AccuracyChart({ data }: AccuracyChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card data-analytics-chart>
        <CardHeader>
          <CardTitle>Accuracy Over Time</CardTitle>
          <CardDescription>Track your performance trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex flex-col items-center justify-center text-center">
            <div className="text-5xl mb-4">📈</div>
            <p className="text-muted-foreground">No accuracy data available yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Complete tests to see your accuracy trend!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate stats
  const avgAccuracy = Math.round(data.reduce((sum, d) => sum + d.accuracy, 0) / data.length);
  const bestAccuracy = Math.max(...data.map(d => d.accuracy));
  const totalTests = data.length;

  // Format data for chart
  const chartData = data.map(point => ({
    date: format(new Date(point.date), 'MMM d'),
    accuracy: point.accuracy,
    testName: point.testName,
    testType: point.testType,
  }));

  return (
    <Card data-analytics-chart>
      <CardHeader>
        <CardTitle>Accuracy Over Time</CardTitle>
        <CardDescription>Your performance trends across {totalTests} tests</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                domain={[0, 100]}
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ReferenceLine 
                y={60} 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="3 3"
                strokeOpacity={0.5}
              />
              <Area
                type="monotone"
                dataKey="accuracy"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                fill="url(#colorAccuracy)"
                fillOpacity={1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Summary Stats */}
        <div className="mt-6 pt-4 border-t grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{avgAccuracy}%</p>
            <p className="text-xs text-muted-foreground">Average</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{bestAccuracy}%</p>
            <p className="text-xs text-muted-foreground">Best</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{totalTests}</p>
            <p className="text-xs text-muted-foreground">Total Tests</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
