'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, XCircle, MinusCircle, Trophy, TrendingUp, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  rank: number | null;
  percentile: number | null;
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
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect' | 'unanswered'>('all');
  
  const percentage = attempt.score && test.totalMarks
    ? ((attempt.score / test.totalMarks) * 100).toFixed(2)
    : '0.00';

  const filteredAnswers = answers.filter(answer => {
    if (filter === 'correct') return answer.isCorrect === true;
    if (filter === 'incorrect') return answer.selectedOption !== null && answer.isCorrect === false;
    if (filter === 'unanswered') return answer.selectedOption === null;
    return true;
  });

  const getOptionLabel = (index: number) => {
    return ['A', 'B', 'C', 'D'][index - 1];
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Score Summary */}
        <Card className="text-center">
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-2">{test.title}</h2>
            <div className="mb-6">
              <div className="text-6xl font-bold mb-2">
                {attempt.score}/{test.totalMarks}
              </div>
              <div className="text-2xl text-muted-foreground">{percentage}%</div>
            </div>
        {(attempt.rank || attempt.percentile) && (
          <div className="flex justify-center gap-6 mb-6 p-4 bg-muted/50 rounded-lg">
            {attempt.rank && (
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <div>
                  <div className="text-2xl font-bold">#{attempt.rank}</div>
                  <div className="text-xs text-muted-foreground">Rank</div>
                </div>
              </div>
            )}
            {attempt.percentile !== null && (
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{(attempt.percentile / 100).toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">Percentile</div>
                </div>
              </div>
            )}
          </div>
        )}

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

        <div className="flex flex-wrap justify-center gap-3">
          <Link href={`/dashboard/tests/${test.id}`}>
            <Button variant="outline" size="sm">Test Details</Button>
          </Link>
          <Link href="/dashboard/tests">
            <Button size="sm">Browse Tests</Button>
          </Link>
        </div>
          </div>
        </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="review">Detailed Review</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                    <div>
                      <div className="text-2xl font-bold text-green-600">{attempt.correctAnswers || 0}</div>
                      <div className="text-sm text-muted-foreground">Correct Answers</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950/20">
                    <XCircle className="w-8 h-8 text-red-600" />
                    <div>
                      <div className="text-2xl font-bold text-red-600">{attempt.incorrectAnswers || 0}</div>
                      <div className="text-sm text-muted-foreground">Incorrect Answers</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                    <MinusCircle className="w-8 h-8 text-muted-foreground" />
                    <div>
                      <div className="text-2xl font-bold text-muted-foreground">{attempt.unanswered || 0}</div>
                      <div className="text-sm text-muted-foreground">Unanswered</div>
                    </div>
                  </div>
                </div>

                {(attempt.rank || attempt.percentile) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {attempt.rank && (
                      <div className="flex items-center gap-3 p-4 rounded-lg border-2 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
                        <Trophy className="w-8 h-8 text-yellow-500" />
                        <div>
                          <div className="text-2xl font-bold">#{attempt.rank}</div>
                          <div className="text-sm text-muted-foreground">Your Rank</div>
                        </div>
                      </div>
                    )}
                    {attempt.percentile !== null && (
                      <div className="flex items-center gap-3 p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
                        <TrendingUp className="w-8 h-8 text-primary" />
                        <div>
                          <div className="text-2xl font-bold">{(attempt.percentile / 100).toFixed(1)}%</div>
                          <div className="text-sm text-muted-foreground">Percentile</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Review Tab */}
        <TabsContent value="review">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <CardTitle>Question-by-Question Review</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant={filter === 'all' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setFilter('all')}
                  >
                    All ({answers.length})
                  </Button>
                  <Button 
                    variant={filter === 'correct' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setFilter('correct')}
                    className={filter === 'correct' ? '' : 'text-green-600'}
                  >
                    Correct ({attempt.correctAnswers || 0})
                  </Button>
                  <Button 
                    variant={filter === 'incorrect' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setFilter('incorrect')}
                    className={filter === 'incorrect' ? '' : 'text-red-600'}
                  >
                    Incorrect ({attempt.incorrectAnswers || 0})
                  </Button>
                  <Button 
                    variant={filter === 'unanswered' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setFilter('unanswered')}
                  >
                    Skipped ({attempt.unanswered || 0})
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
            {filteredAnswers.map((answer, index) => {
              const options = [
                { num: 1, text: answer.option1 },
                { num: 2, text: answer.option2 },
                { num: 3, text: answer.option3 },
                { num: 4, text: answer.option4 },
              ];

              return (
                <div key={answer.questionId} className="border rounded-lg p-6">
                  {/* Question Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <Badge variant="outline" className="mt-1">
                      Q{answer.questionOrder}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-base leading-relaxed">{answer.questionText}</p>
                    </div>
                    {answer.isCorrect === true && (
                      <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                    )}
                    {answer.isCorrect === false && answer.selectedOption !== null && (
                      <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                    )}
                    {answer.selectedOption === null && (
                      <MinusCircle className="w-6 h-6 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>

                  {/* Options */}
                  <div className="space-y-2 mb-4">
                    {options.map((option) => {
                      const isCorrect = option.num === answer.correctOption;
                      const isSelected = option.num === answer.selectedOption;
                      const isWrong = isSelected && !isCorrect;

                      return (
                        <div
                          key={option.num}
                          className={cn(
                            "p-3 rounded-lg border-2 transition-colors",
                            isCorrect && "bg-green-50 dark:bg-green-950/20 border-green-500",
                            isWrong && "bg-red-50 dark:bg-red-950/20 border-red-500",
                            !isCorrect && !isSelected && "bg-muted/30 border-muted"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0",
                              isCorrect && "bg-green-600 text-white",
                              isWrong && "bg-red-600 text-white",
                              !isCorrect && !isSelected && "bg-muted text-muted-foreground"
                            )}>
                              {getOptionLabel(option.num)}
                            </div>
                            <span className={cn(
                              "flex-1",
                              (isCorrect || isWrong) && "font-medium"
                            )}>
                              {option.text}
                            </span>
                            {isCorrect && (
                              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                                Correct Answer
                              </Badge>
                            )}
                            {isSelected && !isCorrect && (
                              <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                                Your Answer
                              </Badge>
                            )}
                            {isSelected && isCorrect && (
                              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                                Your Answer
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {answer.explanation && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Explanation</h4>
                          <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                            {answer.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredAnswers.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No questions match this filter
              </div>
            )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
