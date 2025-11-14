'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, MinusCircle } from 'lucide-react';

interface ReviewAnswer {
  questionId: string;
  questionText: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correctOption: number;
  selectedOption: number | null;
  isCorrect: boolean | null;
  explanation: string | null;
  questionOrder: number;
}

interface AttemptData {
  id: string;
  score: number | null;
  correctAnswers: number | null;
  incorrectAnswers: number | null;
  unanswered: number | null;
  timeSpent: number | null;
}

interface TestData {
  id: string;
  title: string;
  totalMarks: number;
}

interface TestReviewViewProps {
  review: {
    attempt: AttemptData;
    test: TestData;
    answers: ReviewAnswer[];
  };
}

export function TestReviewView({ review }: TestReviewViewProps) {
  const { attempt, test, answers } = review;
  const percentage = attempt.score && test.totalMarks
    ? ((attempt.score / test.totalMarks) * 100).toFixed(2)
    : '0.00';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      {/* Score Summary */}
      <div className="bg-card border rounded-lg p-8 text-center max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-4">Test Complete!</h1>
        <div className="text-6xl font-bold text-green-600 dark:text-green-400 mb-2">
          {attempt.score?.toFixed(2) || 0}/{test.totalMarks}
        </div>
        <p className="text-xl text-muted-foreground mb-6">
          {percentage}% Accuracy
        </p>

        <div className="flex justify-center gap-8 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{attempt.correctAnswers || 0}</span>
            </div>
            <p className="text-sm text-muted-foreground">Correct</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="text-2xl font-bold text-red-600">{attempt.incorrectAnswers || 0}</span>
            </div>
            <p className="text-sm text-muted-foreground">Incorrect</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <MinusCircle className="w-5 h-5 text-muted-foreground" />
              <span className="text-2xl font-bold text-muted-foreground">{attempt.unanswered || 0}</span>
            </div>
            <p className="text-sm text-muted-foreground">Unanswered</p>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Link href={`/dashboard/tests/${test.id}`}>
            <Button variant="outline">View Test Details</Button>
          </Link>
          <Link href="/dashboard/tests">
            <Button className="bg-amber-500 text-black hover:bg-amber-600">Browse More Tests</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
