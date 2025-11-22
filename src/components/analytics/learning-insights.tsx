/**
 * Learning Insights Panel Component
 * 
 * AI-generated recommendations and insights
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Insight } from '@/lib/analytics/types';
import { AlertCircle, CheckCircle2, Info, Lightbulb, X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface LearningInsightsPanelProps {
  insights: Insight[];
}

export function LearningInsightsPanel({ insights }: LearningInsightsPanelProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const getIcon = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      case 'recommendation':
        return <Lightbulb className="w-5 h-5 text-purple-600" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getBgColor = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800';
      case 'warning':
        return 'bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800';
      case 'recommendation':
        return 'bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800';
      default:
        return 'bg-muted border-border';
    }
  };

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => new Set(prev).add(id));
  };

  const visibleInsights = insights.filter(insight => !dismissedIds.has(insight.id));

  if (!insights || insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Learning Insights</CardTitle>
          <CardDescription>Personalized recommendations based on your performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex flex-col items-center justify-center text-center">
            <div className="text-5xl mb-4">💡</div>
            <p className="text-muted-foreground">No insights available yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Complete more tests to receive personalized recommendations!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (visibleInsights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Learning Insights</CardTitle>
          <CardDescription>Personalized recommendations based on your performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex flex-col items-center justify-center text-center">
            <p className="text-muted-foreground">All insights dismissed</p>
            <Button 
              variant="link" 
              size="sm" 
              className="mt-2"
              onClick={() => setDismissedIds(new Set())}
            >
              Show all insights
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning Insights</CardTitle>
        <CardDescription>
          {visibleInsights.length} personalized recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {visibleInsights.map((insight) => (
            <div
              key={insight.id}
              className={`relative rounded-lg border p-4 ${getBgColor(insight.type)}`}
            >
              {/* Dismiss button */}
              {insight.dismissible && (
                <button
                  onClick={() => handleDismiss(insight.id)}
                  className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Dismiss insight"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="mt-0.5">
                  {insight.icon.match(/^\p{Emoji}$/u) ? (
                    <span className="text-2xl">{insight.icon}</span>
                  ) : (
                    getIcon(insight.type)
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2">
                  <div>
                    <h4 className="font-semibold text-sm">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {insight.message}
                    </p>
                  </div>

                  {/* Action button */}
                  {insight.action && (
                    <div>
                      <Link href={insight.action.url}>
                        <Button size="sm" variant="outline" className="h-8 text-xs">
                          {insight.action.label}
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Priority indicator (hidden, for sorting) */}
              {insight.priority >= 4 && (
                <div className="absolute bottom-2 right-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t text-center">
          <p className="text-xs text-muted-foreground">
            Insights are generated based on your recent performance and activity patterns
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
