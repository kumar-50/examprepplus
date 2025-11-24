'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getReadinessDisplay, getSectionReadinessColor } from '@/lib/readiness-calculator';
import type { ReadinessData } from '@/lib/readiness-calculator';

interface ExamReadinessCardProps {
  readiness: ReadinessData;
}

export function ExamReadinessCard({ readiness }: ExamReadinessCardProps) {
  const display = getReadinessDisplay(readiness.status);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exam Readiness</CardTitle>
        <CardDescription>
          {readiness.daysUntilExam !== null && readiness.daysUntilExam >= 0
            ? `Exam in ${readiness.daysUntilExam} days`
            : 'Track your preparation progress'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          {/* Circular Progress */}
          <div className="relative h-32 w-32">
            <svg className="h-full w-full" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                className="text-gray-200 stroke-current"
                strokeWidth="10"
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
              />
              {/* Progress circle */}
              <circle
                className={`${display.color} stroke-current transition-all duration-500`}
                strokeWidth="10"
                strokeLinecap="round"
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                strokeDasharray={`${(readiness.overallReadiness / 100) * 251.2} 251.2`}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{readiness.overallReadiness}%</span>
            </div>
          </div>

          {/* Status */}
          <div className="text-center">
            <span className="text-xl font-semibold">
              {display.emoji} {display.label}
            </span>
          </div>

          {/* Breakdown */}
          <div className="w-full space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Accuracy</span>
              <span className="font-medium">{readiness.breakdown.accuracy}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Coverage</span>
              <span className="font-medium">{readiness.breakdown.coverage}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Trend</span>
              <span className="font-medium">{readiness.breakdown.trend}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Volume</span>
              <span className="font-medium">{readiness.breakdown.volume}%</span>
            </div>
          </div>

          {/* Section Readiness */}
          {readiness.sectionReadiness.length > 0 && (
            <div className="w-full space-y-2 border-t pt-4">
              <h4 className="font-semibold text-sm">Section Readiness</h4>
              {readiness.sectionReadiness.map((section) => (
                <div key={section.sectionId} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{section.sectionName}</span>
                    <span className="font-medium">{section.readiness}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getSectionReadinessColor(section.readiness)} transition-all duration-500`}
                      style={{ width: `${section.readiness}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
