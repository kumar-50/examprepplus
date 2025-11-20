'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFullscreen } from '@/hooks/use-fullscreen';
import { useDebouncedCallback } from '@/hooks/use-debounce';
import { saveAnswer, toggleReviewFlag, submitAttempt } from '@/lib/actions/tests';
import { Clock, Maximize2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SubmitConfirmDialog } from '@/components/tests/submit-confirm-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Question {
  id: string;
  questionText: string;
  questionTextHindi: string | null;
  option1: string;
  option1Hindi: string | null;
  option2: string;
  option2Hindi: string | null;
  option3: string;
  option3Hindi: string | null;
  option4: string;
  option4Hindi: string | null;
  correctAnswer: number;
  explanation: string | null;
  explanationHindi: string | null;
  questionOrder: number;
  sectionId: string | null;
  sectionName?: string | null;
}

interface Test {
  id: string;
  title: string;
  testType: 'mock' | 'live' | 'sectional' | 'practice';
  duration: number;
  totalQuestions: number;
  totalMarks: number;
  negativeMarking: boolean;
  negativeMarkingValue: number | null;
}

interface TestAttemptEngineProps {
  test: Test;
  attemptId: string;
  questions: Question[];
  userId: string;
}

interface Answer {
  questionId: string;
  selectedOption: number | null;
  isMarkedForReview: boolean;
}

export function TestAttemptEngine({ 
  test, 
  attemptId, 
  questions, 
  userId 
}: TestAttemptEngineProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null as any);
  
  // State management
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, Answer>>(new Map());
  const [timeRemaining, setTimeRemaining] = useState(test.duration * 60); // in seconds
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Track if user is submitting
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);

  // Group questions by section
  const questionsBySection = questions.reduce((acc, question) => {
    const sectionId = question.sectionId || 'default';
    if (!acc[sectionId]) {
      acc[sectionId] = {
        id: sectionId,
        name: question.sectionName || 'All Questions',
        questions: [],
      };
    }
    acc[sectionId].questions.push(question);
    return acc;
  }, {} as Record<string, { id: string; name: string; questions: Question[] }>);

  const sections = Object.values(questionsBySection);
  const hasMultipleSections = sections.length > 1;

  // Initialize current section
  useEffect(() => {
    if (!currentSectionId && sections.length > 0) {
      setCurrentSectionId(sections[0]?.id || null);
    }
  }, [sections, currentSectionId]);

  // Reset question index when switching sections
  useEffect(() => {
    if (hasMultipleSections) {
      setCurrentQuestionIndex(0);
    }
  }, [currentSectionId, hasMultipleSections]);

  // Get questions for current section (or all if single section)
  const currentSectionQuestions = hasMultipleSections 
    ? sections.find(s => s.id === currentSectionId)?.questions || []
    : questions;

  // Get current question from section-aware list
  const currentQuestion = currentSectionQuestions[currentQuestionIndex];

  // Fullscreen hook with exit prevention (callback defined below)
  const { 
    isFullscreen, 
    isSupported, 
    enterFullscreen,
    exitFullscreen 
  } = useFullscreen(
    containerRef, 
    undefined, 
    isTestStarted && !isSubmitting, // Only prevent exit if not submitting
    () => {
      // Handle forced exit - submit test immediately
      console.log('User forcefully exited - submitting test immediately');
      router.push(`/dashboard/tests/${test.id}/attempt/${attemptId}/review`);
    }
  );

  // Handle manual test start with fullscreen
  const handleStartTest = async () => {
    setIsLoading(true);
    
    if (isSupported) {
      try {
        await enterFullscreen();
        setIsTestStarted(true);
      } catch (error) {
        console.error('Failed to enter fullscreen:', error);
        // Show warning but allow test to start
        setShowWarning(true);
        setIsTestStarted(true);
      }
    } else {
      setShowWarning(true);
      setIsTestStarted(true);
    }
    
    setIsLoading(false);
  };

  // Timer countdown
  useEffect(() => {
    if (!isTestStarted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Auto-submit test
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTestStarted]);

  // Debounced auto-save function
  const debouncedSaveAnswer = useDebouncedCallback(async (
    questionId: string,
    selectedOption: number | null
  ) => {
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    try {
      await saveAnswer(attemptId, questionId, selectedOption, timeSpent);
      console.log('Answer auto-saved:', { questionId, selectedOption, timeSpent });
    } catch (error) {
      console.error('Failed to auto-save answer:', error);
      // TODO: Show toast notification or retry
    }
  }, 2000); // 2 second debounce

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get time warning color
  const getTimeColor = () => {
    if (timeRemaining <= 60) return 'text-red-600 dark:text-red-400';
    if (timeRemaining <= 300) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-900 dark:text-white';
  };

  // Guard: redirect if no questions at all (not just during section loading)
  useEffect(() => {
    if (questions.length === 0) {
      router.push(`/dashboard/tests/${test.id}`);
    }
  }, [questions.length, router, test.id]);

  // Show loading while sections are initializing
  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const handleAnswerSelect = (optionNumber: number) => {

    setAnswers((prev) => {
      const newAnswers = new Map(prev);
      newAnswers.set(currentQuestion.id, {
        questionId: currentQuestion.id,
        selectedOption: optionNumber,
        isMarkedForReview: prev.get(currentQuestion.id)?.isMarkedForReview || false,
      });
      return newAnswers;
    });

    // Trigger auto-save
    debouncedSaveAnswer(currentQuestion.id, optionNumber);
  };

  const handleMarkForReview = async () => {
    const current = answers.get(currentQuestion.id);
    const newIsMarked = !(current?.isMarkedForReview || false);
    
    setAnswers((prev) => {
      const newAnswers = new Map(prev);
      newAnswers.set(currentQuestion.id, {
        questionId: currentQuestion.id,
        selectedOption: current?.selectedOption || null,
        isMarkedForReview: newIsMarked,
      });
      return newAnswers;
    });

    // Save to database
    try {
      await toggleReviewFlag(attemptId, currentQuestion.id, newIsMarked);
    } catch (error) {
      console.error('Failed to toggle review flag:', error);
    }
  };

  const handleClearResponse = () => {
    setAnswers((prev) => {
      const newAnswers = new Map(prev);
      const current = prev.get(currentQuestion.id);
      if (current) {
        newAnswers.set(currentQuestion.id, {
          ...current,
          selectedOption: null,
        });
      }
      return newAnswers;
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < currentSectionQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setQuestionStartTime(Date.now()); // Reset timer for new question
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setQuestionStartTime(Date.now()); // Reset timer for new question
    }
  };

  const handleSubmit = () => {
    // Show confirmation dialog
    setShowSubmitDialog(true);
  };

  const handleConfirmSubmit = async () => {
    setShowSubmitDialog(false);
    setIsSubmitting(true);
    
    try {
      // Exit fullscreen before submitting
      if (isFullscreen) {
        try {
          await exitFullscreen();
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error('Failed to exit fullscreen:', error);
        }
      }

      // Submit the test to the server
      const result = await submitAttempt(attemptId);
      
      if (!result) {
        throw new Error('Failed to submit test');
      }

      console.log('Test submitted successfully:', result);
      
      // Small delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Redirect to review page
      router.push(`/dashboard/tests/${test.id}/attempt/${attemptId}/review`);
    } catch (error) {
      console.error('Error submitting test:', error);
      setIsSubmitting(false);
      // TODO: Show error toast
      alert('Failed to submit test. Please try again.');
    }
  };

  const getQuestionStatus = (questionId: string) => {
    const answer = answers.get(questionId);
    if (!answer) return 'not-visited';
    if (answer.isMarkedForReview && answer.selectedOption !== null) return 'marked-answered';
    if (answer.isMarkedForReview) return 'marked';
    if (answer.selectedOption !== null) return 'answered';
    return 'visited';
  };

  if (!isTestStarted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <Clock className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Ready to Start?</h2>
            <p className="text-muted-foreground mb-6">
              Click the button below to enter fullscreen mode and begin your test.
            </p>
          </div>
          <Button 
            onClick={handleStartTest}
            disabled={isLoading}
            size="lg"
            className="w-full"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                Starting Test...
              </>
            ) : (
              'Start Fullscreen Test'
            )}
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            The test will lock in fullscreen mode. You cannot exit until you submit.
          </p>
        </div>
      </div>
    );
  }

  // Show loading screen when submitting
  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-500 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold mb-2">Submitting Your Test...</h2>
          <p className="text-muted-foreground">Please wait while we process your answers.</p>
        </div>
      </div>
    );
  }

  // Calculate summary stats for submit dialog
  const answeredCount = Array.from(answers.values()).filter(a => a.selectedOption !== null).length;
  const unansweredCount = questions.length - answeredCount;
  const markedCount = Array.from(answers.values()).filter(a => a.isMarkedForReview).length;

  return (
    <div ref={containerRef} className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Submit Confirmation Dialog */}
      <SubmitConfirmDialog
        open={showSubmitDialog}
        onOpenChange={setShowSubmitDialog}
        onConfirm={handleConfirmSubmit}
        totalQuestions={questions.length}
        answered={answeredCount}
        unanswered={unansweredCount}
        markedForReview={markedCount}
      />

      {/* Warning for no fullscreen support */}
      {showWarning && !isFullscreen && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your browser doesn't support fullscreen mode. You can continue the test, but the experience may not be optimal.
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <header className="bg-card border-b px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-lg font-semibold">
            {test.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            Attempt ID: {attemptId.slice(0, 8)}...
          </p>
        </div>

        <div className="flex items-center gap-6">
          {/* Timer */}
          <div className="flex items-center gap-2">
            <Clock className={`w-5 h-5 ${getTimeColor()}`} />
            <span className={`text-2xl font-mono font-bold ${getTimeColor()}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>

          {/* Fullscreen Toggle */}
          {isSupported && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => isFullscreen ? exitFullscreen() : enterFullscreen()}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          )}

          {/* Submit Button */}
          <Button onClick={handleSubmit} variant="destructive">
            Submit Test
          </Button>
        </div>
      </header>

      {/* Section Tabs (for multi-section tests) */}
      {hasMultipleSections && currentSectionId && (
        <div className="border-b bg-card">
          <div className="px-6">
            <Tabs value={currentSectionId} onValueChange={setCurrentSectionId}>
              <TabsList className="h-12 bg-transparent border-0 p-0">
                {sections.map((section) => (
                  <TabsTrigger
                    key={section.id}
                    value={section.id}
                    className="px-6 h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    {section.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Question Display */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl">
            {/* Question Number */}
            <div className="mb-4">
              <span className="text-sm font-medium text-muted-foreground">
                Question {currentQuestionIndex + 1} of {hasMultipleSections ? currentSectionQuestions.length : questions.length}
              </span>
              {!hasMultipleSections && currentQuestion.sectionName && (
                <span className="ml-3 text-sm text-muted-foreground">
                  Section: {currentQuestion.sectionName}
                </span>
              )}
            </div>

            {/* Question Text */}
            <div className="bg-card rounded-lg p-6 mb-6 border">
              <p className="text-lg leading-relaxed">
                {currentQuestion.questionText}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {[1, 2, 3, 4].map((optionNumber) => {
                const isSelected = answers.get(currentQuestion.id)?.selectedOption === optionNumber;
                return (
                  <button
                    key={optionNumber}
                    onClick={() => handleAnswerSelect(optionNumber)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                        : 'border bg-card hover:border-muted-foreground/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500'
                          : 'border-muted-foreground'
                      }`}>
                        {isSelected && (
                          <div className="w-3 h-3 rounded-full bg-white"></div>
                        )}
                      </div>
                      <span>
                        {currentQuestion[`option${optionNumber}` as keyof Question] as string}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex items-center justify-between gap-4">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClearResponse}
                  disabled={!answers.get(currentQuestion.id)?.selectedOption}
                >
                  Clear Response
                </Button>
                <Button
                  variant="outline"
                  onClick={handleMarkForReview}
                >
                  {answers.get(currentQuestion.id)?.isMarkedForReview 
                    ? 'Unmark Review' 
                    : 'Mark for Review'}
                </Button>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={currentQuestionIndex === questions.length - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Navigation Palette */}
        <div className="w-80 bg-card border-l overflow-y-auto p-6">
          <h3 className="font-semibold mb-4">
            Question Palette
          </h3>

          {/* Question Grid */}
          <div className="grid grid-cols-5 gap-2 mb-6">
            {currentSectionQuestions.map((question, index) => {
              const status = getQuestionStatus(question.id);
              const isCurrent = index === currentQuestionIndex;

              let bgColor = 'bg-muted'; // not-visited
              if (status === 'answered') bgColor = 'bg-green-500 dark:bg-green-600';
              if (status === 'visited') bgColor = 'bg-red-500 dark:bg-red-600';
              if (status === 'marked') bgColor = 'bg-purple-500 dark:bg-purple-600';
              if (status === 'marked-answered') bgColor = 'bg-purple-500 dark:bg-purple-600';

              return (
                <button
                  key={question.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`
                    h-10 w-10 rounded-lg font-medium text-sm transition-all
                    ${bgColor}
                    ${isCurrent ? 'ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-background' : ''}
                    ${status === 'not-visited' ? '' : 'text-white'}
                    hover:opacity-80
                  `}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="space-y-2 text-sm">
            <h4 className="font-medium mb-3">Legend:</h4>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-green-500"></div>
              <span className="text-muted-foreground">Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-red-500"></div>
              <span className="text-muted-foreground">Not Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-purple-500"></div>
              <span className="text-muted-foreground">Marked for Review</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-muted"></div>
              <span className="text-muted-foreground">Not Visited</span>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium mb-3">Summary:</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Answered:</span>
                <span className="font-medium">
                  {Array.from(answers.values()).filter(a => a.selectedOption !== null).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Not Answered:</span>
                <span className="font-medium">
                  {questions.length - Array.from(answers.values()).filter(a => a.selectedOption !== null).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Marked:</span>
                <span className="font-medium">
                  {Array.from(answers.values()).filter(a => a.isMarkedForReview).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
