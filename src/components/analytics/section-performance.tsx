/**
 * Section Performance Chart Component
 * 
 * Horizontal bar chart comparing performance across sections
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
} from 'recharts';
import type { SectionPerformance } from '@/lib/analytics/types';

const chartConfig = {
  accuracy: {
    label: 'Accuracy',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

interface SectionPerformanceChartProps {
  data: SectionPerformance[];
}

export function SectionPerformanceChart({ data }: SectionPerformanceChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Section Performance</CardTitle>
          <CardDescription>Performance breakdown by section</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex flex-col items-center justify-center text-center">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-muted-foreground">No section data available yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Answer questions to see section performance!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Section Performance</CardTitle>
        <CardDescription>
          Accuracy across {data.length} sections
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer 
          config={chartConfig} 
          className="w-full" 
          style={{ height: `${Math.max(300, data.length * 50)}px` }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              layout="vertical"
              margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                type="number" 
                domain={[0, 100]}
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                dataKey="sectionName" 
                type="category"
                width={120}
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                cursor={{ fill: 'hsl(var(--muted) / 0.2)' }}
              />
              <Bar 
                dataKey="accuracy" 
                fill="var(--color-accuracy)"
                radius={[0, 8, 8, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Performance Legend */}
        <div className="mt-6 pt-4 border-t grid grid-cols-2 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-muted-foreground">Excellent (80%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-muted-foreground">Good (70-79%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-muted-foreground">Fair (50-69%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-muted-foreground">Needs Work (&lt;50%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
