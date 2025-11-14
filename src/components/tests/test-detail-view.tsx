'use client';

import { useState } from 'react';
import { Clock, FileText, Star, Lock, Play } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Test {
  id: string;
  title: string;
  description: string | null;
  testType: string;
  totalQuestions: number;
  totalMarks: number;
  duration: number;
  isFree: boolean;
  bannerImage: string | null;
  averageRating: number | null;
  totalRatings: number | null;
  totalAttempts: number | null;
  instructions: string | null;
}

interface Section {
  id: string;
  name: string;
  questionCount: number;
  description: string | null;
}

interface Attempt {
  id: string;
  score: number | null;
  startedAt: Date;
  submittedAt: Date | null;
  status: string;
  correctAnswers: number | null;
  incorrectAnswers: number | null;
  unanswered: number | null;
}

interface TestDetailViewProps {
  test: Test;
  userId: string;
  attemptHistory: Attempt[];
}

export function TestDetailView({ test, userId, attemptHistory }: TestDetailViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Banner */}
        <div className="bg-muted rounded-lg h-64 flex items-center justify-center">
          {test.bannerImage ? (
            <img src={test.bannerImage} alt={test.title} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <span className="text-6xl">📝</span>
          )}
        </div>

        {/* Title and Metadata */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">
            {test.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4">
            <Badge className="bg-amber-500 hover:bg-amber-500 text-white">
              <Clock className="w-4 h-4 mr-1" />
              {test.duration} min
            </Badge>
            <Badge className="bg-amber-500 hover:bg-amber-500 text-white">
              <FileText className="w-4 h-4 mr-1" />
              {test.totalQuestions} Questions
            </Badge>
            <Badge variant="outline" className="capitalize">
              {test.testType}
            </Badge>
            {test.averageRating && test.totalRatings ? (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{test.averageRating.toFixed(1)}</span>
                <span className="text-muted-foreground">({test.totalRatings})</span>
              </div>
            ) : null}
          </div>

          {test.description && (
            <p className="text-muted-foreground leading-relaxed">
              {test.description}
            </p>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="attempts" className="w-full">
          <TabsList>
            <TabsTrigger value="attempts">Attempt History</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="attempts" className="mt-6">
            {attemptHistory.length > 0 ? (
              <div className="space-y-4">
                {attemptHistory.map((attempt, index) => (
                  <div
                    key={attempt.id}
                    className="bg-card border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">
                          Attempt #{attemptHistory.length - index}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(attempt.startedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        {attempt.status === 'submitted' || attempt.status === 'auto_submitted' ? (
                          <>
                            <div className="text-2xl font-bold">
                              {attempt.score?.toFixed(2) || 0}/{test.totalMarks}
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline" className="text-green-600">
                                ✓ {attempt.correctAnswers || 0}
                              </Badge>
                              <Badge variant="outline" className="text-red-600">
                                ✗ {attempt.incorrectAnswers || 0}
                              </Badge>
                              <Badge variant="outline" className="text-gray-600">
                                - {attempt.unanswered || 0}
                              </Badge>
                            </div>
                          </>
                        ) : (
                          <Badge variant="secondary">In Progress</Badge>
                        )}
                      </div>
                    </div>
                    {(attempt.status === 'submitted' || attempt.status === 'auto_submitted') && (
                      <div className="mt-4">
                        <Link href={`/dashboard/tests/${test.id}/attempt/${attempt.id}/review`}>
                          <Button variant="outline" size="sm" className="w-full">
                            View Review
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No attempts yet. Start your first attempt now!
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <div className="text-center py-12 text-gray-500">
              Reviews coming soon
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-card rounded-lg border p-6 sticky top-8 space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Take the Test</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ready to test your knowledge?
            </p>

            {test.isFree ? (
              <Link href={`/dashboard/tests/${test.id}/attempt`}>
                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black" size="lg">
                  <Play className="w-5 h-5 mr-2" />
                  Start Test
                </Button>
              </Link>
            ) : (
              <Button className="w-full" size="lg" variant="outline">
                <Lock className="w-5 h-5 mr-2" />
                Unlock Test
              </Button>
            )}
          </div>

          {test.averageRating !== null && (
            <div className="pt-4 border-t">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">
                  {test.averageRating.toFixed(1)} ⭐
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on {test.totalRatings} ratings
                </p>
              </div>
            </div>
          )}

          {test.totalAttempts !== null && test.totalAttempts > 0 && (
            <div className="text-center text-sm text-muted-foreground">
              Attempted by {test.totalAttempts.toLocaleString()} users
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
