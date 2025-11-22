'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain } from 'lucide-react';
import { WeakTopicCard } from './weak-topic-card';

interface WeakTopic {
  id: string;
  sectionId: string;
  sectionName: string;
  accuracyPercentage: number;
  weaknessLevel: string | null;
  totalAttempts: number;
  correctAttempts: number;
  nextReviewDate: Date | null;
  lastPracticedAt: Date | null;
}

interface WeakTopicsSectionProps {
  weakTopics: WeakTopic[];
  userId: string;
}

export function WeakTopicsSection({ weakTopics, userId }: WeakTopicsSectionProps) {
  return (
    <Card className="border-prussian-blue-500/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
            <Brain className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <CardTitle className="text-lg">Weak Topics</CardTitle>
            <CardDescription className="text-sm">
              AI-identified areas for improvement
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {weakTopics.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 mb-4">
              <Brain className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Great Job!</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              No weak topics identified yet. Keep taking tests to help us identify areas for improvement.
            </p>
          </div>
        ) : (
          // Card Grid Layout
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weakTopics.map((topic) => (
              <WeakTopicCard
                key={topic.id}
                id={topic.id}
                sectionId={topic.sectionId}
                sectionName={topic.sectionName}
                accuracyPercentage={topic.accuracyPercentage}
                weaknessLevel={topic.weaknessLevel}
                totalAttempts={topic.totalAttempts}
                correctAttempts={topic.correctAttempts}
                userId={userId}
                nextReviewDate={topic.nextReviewDate}
                lastPracticedAt={topic.lastPracticedAt}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
