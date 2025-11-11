'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, FileText, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';

interface TestInstructionsProps {
  test: {
    id: string;
    title: string;
    description: string | null;
    testType: 'mock' | 'live' | 'sectional' | 'practice';
    totalQuestions: number;
    totalMarks: number;
    duration: number;
    negativeMarking: boolean;
    negativeMarkingValue: number | null;
    instructions: string | null;
  };
  attemptId: string;
  questionCount: number;
  sectionCount: number;
}

export function TestInstructions({
  test,
  attemptId,
  questionCount,
  sectionCount,
}: TestInstructionsProps) {
  const router = useRouter();
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleStartTest = () => {
    if (!acceptedTerms) return;
    
    // Navigate to test engine with attempt ID
    router.push(`/dashboard/tests/${test.id}/attempt?attemptId=${attemptId}&lang=en`);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} minutes`;
  };

  const getNegativeMarking = () => {
    if (!test.negativeMarking) return 'No negative marking';
    const value = (test.negativeMarkingValue || 0) / 100;
    return `${Math.abs(value)} mark(s) deducted for wrong answer`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant={test.testType === 'mock' ? 'default' : 'secondary'} className="uppercase">
              {test.testType}
            </Badge>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {test.title}
            </h1>
          </div>
          {test.description && (
            <p className="text-gray-600 dark:text-gray-400">
              {test.description}
            </p>
          )}
        </div>

        {/* Test Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {formatDuration(test.duration)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Questions</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {questionCount}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Marks</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {test.totalMarks}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Marking Scheme */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Marking Scheme
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Correct Answer</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  +{(test.totalMarks / questionCount).toFixed(2)} marks
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Wrong Answer</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {getNegativeMarking()}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Unanswered</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No marks deducted
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Instructions */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Important Instructions
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            {test.instructions ? (
              <div className="prose dark:prose-invert max-w-none">
                {test.instructions.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-medium">
                    1
                  </span>
                  <p>
                    The test will be locked in <strong>fullscreen mode</strong>. You cannot exit fullscreen until you submit the test.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-medium">
                    2
                  </span>
                  <p>
                    A countdown timer will be displayed. The test will be <strong>auto-submitted</strong> when the timer reaches 00:00.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-medium">
                    3
                  </span>
                  <p>
                    You can navigate between questions using the navigation palette on the right side.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-medium">
                    4
                  </span>
                  <p>
                    You can mark questions for review and return to them later before submitting.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-medium">
                    5
                  </span>
                  <p>
                    Your answers are <strong>auto-saved</strong> as you progress through the test.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-medium">
                    6
                  </span>
                  <p>
                    Make sure you have a stable internet connection throughout the test.
                  </p>
                </div>
              </>
            )}
          </div>

          <Separator className="my-6" />

          {/* Terms Checkbox */}
          <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <Checkbox
              id="terms"
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
              className="mt-1"
            />
            <label
              htmlFor="terms"
              className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer flex-1"
            >
              I have read and understood all the instructions. I am ready to begin the test in fullscreen mode and understand that I cannot exit until I submit the test.
            </label>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={handleStartTest}
            disabled={!acceptedTerms}
            size="lg"
            className="px-8"
          >
            I'm Ready, Start Test
          </Button>
        </div>
      </div>
    </div>
  );
}
