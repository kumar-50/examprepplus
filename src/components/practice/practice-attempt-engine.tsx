'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Lightbulb,
  BookOpen,
  Flag,
  Clock
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
  topicName?: string;
  difficulty?: string;
}

interface PracticeSession {
  id: string;
  title: string;
  totalQuestions: number;
  difficulty: string | null;
}

interface PracticeAttemptEngineProps {
  session: PracticeSession;
  questions: Question[];
  userId: string;
}

interface Answer {
  questionId: string;
  selectedOption: number | null;
  timeSpent?: number;
}

export function PracticeAttemptEngine({ 
  session, 
  questions, 
  userId 
}: PracticeAttemptEngineProps) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, Answer>>(new Map());
  const [showHindi, setShowHindi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionStartTimes, setQuestionStartTimes] = useState<Map<string, number>>(new Map());

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? answers.get(currentQuestion.id) : undefined;

  useEffect(() => {
    // Set start time for new questions
    if (currentQuestion && !questionStartTimes.has(currentQuestion.id)) {
      setQuestionStartTimes(prev => new Map(prev).set(currentQuestion.id, Date.now()));
    }
  }, [currentQuestionIndex, currentQuestion, questionStartTimes]);

  const handleOptionSelect = (option: number) => {
    if (!currentQuestion) return;

    setAnswers(prev => {
      const newAnswers = new Map(prev);
      newAnswers.set(currentQuestion.id, {
        questionId: currentQuestion.id,
        selectedOption: option,
      });
      return newAnswers;
    });
  };

  const handleSubmitQuiz = async () => {
    // Check if all questions are answered
    const unansweredCount = questions.filter(q => !answers.has(q.id) || !answers.get(q.id)?.selectedOption).length;
    
    if (unansweredCount > 0) {
      toast.error(`Please answer all questions. ${unansweredCount} question(s) remaining.`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate time spent for each question
      const answersWithTime = questions.map(q => {
        const answer = answers.get(q.id)!;
        const startTime = questionStartTimes.get(q.id) || Date.now();
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        const isCorrect = answer.selectedOption === q.correctAnswer;
        
        return {
          questionId: q.id,
          selectedOption: answer.selectedOption,
          isCorrect,
          timeSpent,
        };
      });

      // Submit all answers at once
      await fetch('/api/practice/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          userId,
          answers: answersWithTime,
        }),
      });

      toast.success('Quiz submitted successfully!');
      router.push(`/dashboard/practice/review/${session.id}`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowHindi(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowHindi(false);
    }
  };

  const answeredCount = Array.from(answers.values()).filter(a => a.selectedOption !== null).length;
  const progressPercentage = (answeredCount / questions.length) * 100;

  const getOptionClass = (optionNumber: number) => {
    return currentAnswer?.selectedOption === optionNumber
      ? 'border-orange-500 bg-orange-500/10'
      : 'border-prussian-blue-500/20 hover:border-prussian-blue-500/40';
  };

  if (!currentQuestion) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid h-screen grid-rows-[auto_1fr] lg:grid-cols-[1fr_300px]">
      {/* Header - spans full width */}
      <div className="border-b border-prussian-blue-500/20 bg-card shadow-sm lg:col-span-2">
        <div className="px-6 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">{session.title}</h1>
                <p className="text-sm text-muted-foreground">Practice Mode</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-muted-foreground">Progress:</span>
                <span className="ml-2 font-semibold text-orange-500">
                  {answeredCount}/{questions.length}
                </span>
              </div>
            </div>
          </div>
          <Progress value={progressPercentage} className="mt-3 h-2" />
        </div>
      </div>

      {/* Main Content - left side */}
      <div className="overflow-y-auto px-4 py-4">
        <div className="mx-auto mb-2 max-w-4xl space-y-6">
          {/* Question Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-prussian-blue-500/10 text-prussian-blue-500">
                  Question {currentQuestionIndex + 1} of {questions.length}
              </Badge>
                {currentQuestion.topicName && (
                  <Badge variant="outline" className="bg-orange-500/10 text-orange-500">
                    {currentQuestion.topicName}
                  </Badge>
                )}
                {currentQuestion.difficulty && (
                  <Badge variant="outline" className={cn(
                    currentQuestion.difficulty === 'easy' && 'bg-green-500/10 text-green-500',
                    currentQuestion.difficulty === 'medium' && 'bg-orange-500/10 text-orange-500',
                    currentQuestion.difficulty === 'hard' && 'bg-red-500/10 text-red-500'
                  )}>
                    {currentQuestion.difficulty}
                  </Badge>
                )}
            </div>
              {currentQuestion.questionTextHindi && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHindi(!showHindi)}
                >
                  {showHindi ? 'English' : 'हिंदी'}
                </Button>
              )}
            </div>
        </div>

            {/* Question Card */}
            <Card>
              <CardContent className="pt-2">
                <div className="prose prose-sm max-w-none">
                  <p className="text-base font-medium leading-relaxed">
                    {showHindi && currentQuestion.questionTextHindi
                      ? currentQuestion.questionTextHindi
                      : currentQuestion.questionText}
                  </p>
                </div>

                <Separator className="my-3" />

                {/* Options */}
                <RadioGroup
                  value={currentAnswer?.selectedOption?.toString() || ''}
                  onValueChange={(value) => handleOptionSelect(parseInt(value))}
                  className="space-y-1"
                >
                  {[1, 2, 3, 4].map((optionNum) => {
                    const optionText = showHindi && (currentQuestion as any)[`option${optionNum}Hindi`]
                      ? (currentQuestion as any)[`option${optionNum}Hindi`]
                      : (currentQuestion as any)[`option${optionNum}`];

                    return (
                      <div
                        key={optionNum}
                        className={cn(
                          'relative flex items-start space-x-3 rounded-lg border-2 p-4 transition-all cursor-pointer',
                          getOptionClass(optionNum)
                        )}
                      >
                        <RadioGroupItem
                          value={optionNum.toString()}
                          id={`option-${optionNum}`}
                          className="mt-0.5"
                        />
                        <Label
                          htmlFor={`option-${optionNum}`}
                          className="flex-1 cursor-pointer text-sm leading-relaxed"
                        >
                          {optionText}
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>

                {/* Submit Button - shown at bottom of all questions on last question */}
                {currentQuestionIndex === questions.length - 1 && (
                  <div className="mt-6">
                    <Button
                      onClick={handleSubmitQuiz}
                      disabled={isSubmitting || answeredCount < questions.length}
                      className="w-full bg-green-500 hover:bg-green-600 text-white"
                      size="lg"
                    >
                      {isSubmitting ? (
                        'Submitting...'
                      ) : answeredCount < questions.length ? (
                        `Submit Quiz (${answeredCount}/${questions.length} answered)`
                      ) : (
                        'Submit Quiz'
                      )}
                    </Button>
                    {answeredCount < questions.length && (
                      <p className="text-sm text-muted-foreground text-center mt-2">
                        Please answer all questions before submitting
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center mt-2 justify-between gap-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              {currentQuestionIndex < questions.length - 1 && (
                <Button
                  onClick={handleNext}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Next Question
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
    
      {/* Question Palette Sidebar - right side */}
      <div className="hidden overflow-y-auto border-l border-prussian-blue-500/20 bg-card p-4 lg:block">
        <h3 className="text-sm font-semibold mb-4">Question Palette</h3>
        <div className="grid grid-cols-5 gap-2">
          {questions.map((q, idx) => {
            const answer = answers.get(q.id);
            return (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={cn(
                  'aspect-square rounded-md text-sm font-medium transition-colors border-2',
                  idx === currentQuestionIndex && 'ring-2 ring-orange-500 ring-offset-2',
                  !answer?.selectedOption && 'border-prussian-blue-500/20 bg-background hover:bg-accent',
                  answer?.selectedOption && 'border-orange-500 bg-orange-500/20 text-orange-700'
                )}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        <div className="mt-6 space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded border-2 border-orange-500 bg-orange-500/20" />
            <span>Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded border-2 border-prussian-blue-500/20 bg-background" />
            <span>Not Answered</span>
          </div>
        </div>
      </div>
    </div>
  );
}
