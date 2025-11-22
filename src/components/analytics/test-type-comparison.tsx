/**
 * Test Type Comparison Component
 * 
 * Grouped bar chart comparing performance across test types
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ChartConfig, 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { TestTypeComparison } from '@/lib/analytics/types';

const chartConfig = {
  avgAccuracy: {
    label: 'Accuracy',
    color: 'hsl(var(--chart-1))',
  },
  passRate: {
    label: 'Pass Rate',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

interface TestTypeComparisonProps {
  data: TestTypeComparison[];
}

export function TestTypeComparisonChart({ data }: TestTypeComparisonProps) {
  const formatTestType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Test Type Comparison</CardTitle>
          <CardDescription>Compare performance across test types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex flex-col items-center justify-center text-center">
            <div className="text-5xl mb-4">📝</div>
            <p className="text-muted-foreground">No test type data available yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Complete different types of tests to see comparisons!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform data for chart
  const chartData = data.map((item) => ({
    name: formatTestType(item.testType),
    avgAccuracy: item.avgAccuracy,
    passRate: item.passRate,
    testCount: item.testCount,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Type Comparison</CardTitle>
        <CardDescription>
          Performance across {data.length} test types
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar 
                dataKey="avgAccuracy" 
                fill="var(--color-avgAccuracy)" 
                radius={[8, 8, 0, 0]} 
              />
              <Bar 
                dataKey="passRate" 
                fill="var(--color-passRate)" 
                radius={[8, 8, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Summary Stats */}
        <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">
              {data.length > 0 ? Math.round(data.reduce((sum, d) => sum + d.avgAccuracy, 0) / data.length) : 0}%
            </p>
            <p className="text-xs text-muted-foreground">Overall Avg</p>
          </div>
          <div>
            <p className="text-2xl font-bold">
              {data.length > 0 ? data.reduce((sum, d) => sum + d.testCount, 0) : 0}
            </p>
            <p className="text-xs text-muted-foreground">Total Tests</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {data.length > 0 ? Math.round(data.reduce((sum, d) => sum + d.passRate, 0) / data.length) : 0}%
            </p>
            <p className="text-xs text-muted-foreground">Avg Pass Rate</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
