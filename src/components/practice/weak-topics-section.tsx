'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, TrendingDown, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface WeakTopic {
  id: string;
  topicId: string;
  topicName: string;
  accuracyPercentage: number;
  weaknessLevel: string | null;
  totalAttempts: number;
  correctAttempts: number;
  nextReviewDate: Date | null;
}

interface WeakTopicsSectionProps {
  weakTopics: WeakTopic[];
  userId: string;
}

export function WeakTopicsSection({ weakTopics, userId }: WeakTopicsSectionProps) {
  const hasWeakTopics = weakTopics.length > 0;

  const getWeaknessColor = (level: string | null) => {
    switch (level) {
      case 'critical':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'moderate':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'improving':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return 'bg-prussian-blue-500/10 text-prussian-blue-500 border-prussian-blue-500/20';
    }
  };

  const getDaysUntilReview = (nextReviewDate: Date | null) => {
    if (!nextReviewDate) return null;
    const now = new Date();
    const diff = new Date(nextReviewDate).getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <Card className="border-prussian-blue-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
              <Brain className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Focus on Weak Topics</CardTitle>
              <CardDescription className="text-sm">
                AI-identified areas for improvement
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!hasWeakTopics ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-prussian-blue-500/10 mb-4">
              <AlertCircle className="h-8 w-8 text-prussian-blue-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Weak Topics Identified</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Identify your weak topics by taking our comprehensive mock tests. Our AI will analyze your performance.
            </p>
            <Button asChild>
              <Link href="/dashboard/tests">
                <ArrowRight className="mr-2 h-4 w-4" />
                Take Mock Test
              </Link>
            </Button>
          </div>
        ) : (
          // Weak Topics List
          <div className="space-y-4">
            {weakTopics.map((topic) => {
              const daysUntilReview = getDaysUntilReview(topic.nextReviewDate);
              
              return (
                <div
                  key={topic.id}
                  className="flex items-center justify-between rounded-lg border border-prussian-blue-500/10 p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-sm">
                        {topic.topicName || 'Unknown Topic'}
                      </h4>
                      {topic.weaknessLevel && (
                        <Badge
                          variant="outline"
                          className={`text-xs ${getWeaknessColor(topic.weaknessLevel)}`}
                        >
                          {topic.weaknessLevel}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        {topic.correctAttempts}/{topic.totalAttempts} correct
                      </span>
                      <span className="text-orange-500 font-medium">
                        {topic.accuracyPercentage}% accuracy
                      </span>
                      {daysUntilReview !== null && (
                        <span>
                          Due in {daysUntilReview} {daysUntilReview === 1 ? 'day' : 'days'}
                        </span>
                      )}
                    </div>
                    <Progress 
                      value={topic.accuracyPercentage} 
                      className="h-1.5 mt-2"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-4 text-orange-500 hover:text-orange-600 hover:bg-orange-500/10"
                    asChild
                  >
                    <Link href={`/dashboard/practice/quiz?topic=${topic.topicId}`}>
                      Revise Now
                      <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              );
            })}
            
            <Button 
              variant="outline" 
              className="w-full mt-2 border-orange-500/20 text-orange-500 hover:bg-orange-500/10"
              asChild
            >
              <Link href="/dashboard/practice/generate">
                <Brain className="mr-2 h-4 w-4" />
                Generate Custom Quiz
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
