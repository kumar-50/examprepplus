import { requireAuth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { userTestAttempts, tests, userAnswers, questions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  XCircle, 
  Award,
  Target,
  Clock,
  TrendingUp,
  ArrowLeft,
  Lightbulb
} from 'lucide-react';
import Link from 'next/link';
import { BackToPracticeButton } from '@/components/practice/back-to-practice-button';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default async function PracticeReviewPage({ params }: PageProps) {
  const { sessionId } = await params;
  
  console.log('📊 Review page: sessionId', sessionId);
  
  let user;
  try {
    user = await requireAuth();
    console.log('✅ Review page: User authenticated', user.id);
  } catch (error) {
    console.error('❌ Review page: Auth failed', error);
    redirect('/login?redirect=/dashboard/practice');
  }

  try {
    console.log('🔍 Fetching attempt data...');
    // Fetch the practice attempt with results
    const [attempt] = await db
      .select({
        id: userTestAttempts.id,
        userId: userTestAttempts.userId,
        testId: userTestAttempts.testId,
        status: userTestAttempts.status,
        correctAnswers: userTestAttempts.correctAnswers,
        incorrectAnswers: userTestAttempts.incorrectAnswers,
        unanswered: userTestAttempts.unanswered,
        totalMarks: userTestAttempts.totalMarks,
        score: userTestAttempts.score,
        submittedAt: userTestAttempts.submittedAt,
        testTitle: tests.title,
        testType: tests.testType,
      })
      .from(userTestAttempts)
      .innerJoin(tests, eq(userTestAttempts.testId, tests.id))
      .where(
        and(
          eq(userTestAttempts.id, sessionId),
          eq(userTestAttempts.userId, user.id)
        )
      )
      .limit(1);

    console.log('🔍 Attempt found:', !!attempt);

    if (!attempt) {
      console.log('❌ No attempt found, redirecting...');
      redirect('/dashboard/practice');
    }

    // If not submitted yet, redirect back to session
    if (attempt.status !== 'submitted') {
      console.log('⚠️ Attempt not submitted, redirecting to session...');
      redirect(`/dashboard/practice/session/${sessionId}`);
    }

    console.log('🔍 Fetching answers with questions...');
    // Fetch all answers with questions
    const answersWithQuestions = await db
      .select({
        answerId: userAnswers.id,
        questionId: userAnswers.questionId,
        selectedOption: userAnswers.selectedOption,
        isCorrect: userAnswers.isCorrect,
        timeSpent: userAnswers.timeSpent,
        questionText: questions.questionText,
        option1: questions.option1,
        option2: questions.option2,
        option3: questions.option3,
        option4: questions.option4,
        correctAnswer: questions.correctOption,
        explanation: questions.explanation,
        sectionId: questions.sectionId,
      })
      .from(userAnswers)
      .innerJoin(questions, eq(userAnswers.questionId, questions.id))
      .where(eq(userAnswers.attemptId, sessionId));

    console.log('✅ Answers fetched:', answersWithQuestions.length);

    const totalQuestions = (attempt.correctAnswers ?? 0) + (attempt.incorrectAnswers ?? 0) + (attempt.unanswered ?? 0);
    const accuracyPercentage = totalQuestions > 0 ? ((attempt.correctAnswers ?? 0) / totalQuestions) * 100 : 0;
    
    console.log('📊 Stats:', { totalQuestions, accuracyPercentage });
    console.log('🎉 Rendering review page...');

    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <BackToPracticeButton />
      </div>

      {/* Results Summary */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Award className="h-6 w-6 text-orange-500" />
                Practice Quiz Results
              </CardTitle>
              <p className="text-muted-foreground mt-1">{attempt.testTitle}</p>
            </div>
            <Badge 
              variant={accuracyPercentage >= 80 ? 'default' : accuracyPercentage >= 60 ? 'secondary' : 'destructive'}
              className="text-lg px-4 py-2"
            >
              {accuracyPercentage.toFixed(1)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Overall Performance</span>
                <span className="text-sm text-muted-foreground">
                  {attempt.correctAnswers ?? 0}/{totalQuestions} Correct
                </span>
              </div>
              <Progress value={accuracyPercentage} className="h-3" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-lg border bg-green-500/5 border-green-500/20">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-green-500">{attempt.correctAnswers ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Correct</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg border bg-red-500/5 border-red-500/20">
                <XCircle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold text-red-500">{attempt.incorrectAnswers ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Incorrect</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg border">
                <Target className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{totalQuestions}</p>
                  <p className="text-xs text-muted-foreground">Total Questions</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg border">
                <TrendingUp className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{attempt.score ?? 0}/{attempt.totalMarks ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Marks</p>
                </div>
              </div>
            </div>

            {/* Performance Message */}
            <div className="p-4 rounded-lg border bg-muted/50">
              <p className="text-sm">
                {accuracyPercentage >= 80 ? (
                  <span className="text-green-600 font-medium">🎉 Excellent work! You have a strong grasp of this material.</span>
                ) : accuracyPercentage >= 60 ? (
                  <span className="text-orange-600 font-medium">👍 Good job! Review the incorrect answers to improve further.</span>
                ) : (
                  <span className="text-red-600 font-medium">📚 Keep practicing! Focus on understanding the concepts better.</span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question-by-Question Review */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Detailed Review</h2>
        {answersWithQuestions.map((item, index) => (
          <Card key={item.answerId} className={item.isCorrect ? 'border-green-500/30' : 'border-red-500/30'}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Question {index + 1}</Badge>
                  {item.isCorrect ? (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Correct
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Incorrect
                    </Badge>
                  )}
                </div>
                {item.timeSpent && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {item.timeSpent}s
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-base font-medium leading-relaxed">{item.questionText}</p>

              <div className="space-y-2">
                {[1, 2, 3, 4].map((optNum) => {
                  const optionText = (item as any)[`option${optNum}`];
                  const isSelected = item.selectedOption === optNum;
                  const isCorrectOption = item.correctAnswer === optNum;

                  return (
                    <div
                      key={optNum}
                      className={`p-3 rounded-lg border-2 ${
                        isCorrectOption
                          ? 'border-green-500 bg-green-500/10'
                          : isSelected && !item.isCorrect
                          ? 'border-red-500 bg-red-500/10'
                          : 'border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{optionText}</span>
                        {isCorrectOption && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                        {isSelected && !item.isCorrect && <XCircle className="h-4 w-4 text-red-500" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {!item.isCorrect && item.explanation && (
                <div className="p-4 rounded-lg border border-orange-500/20 bg-orange-500/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-orange-500" />
                    <h4 className="text-sm font-semibold text-orange-500">Explanation</h4>
                  </div>
                  <p className="text-sm leading-relaxed">{item.explanation}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-4 justify-center">
        <Link href="/dashboard/practice">
          <Button variant="outline" size="lg">
            Back to Practice Dashboard
          </Button>
        </Link>
        <Link href="/dashboard/practice">
          <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
            Start New Practice
          </Button>
        </Link>
      </div>
    </div>
    );
  } catch (error) {
    console.error('❌ Error in Review Page:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack',
      sessionId
    });
    throw error;
  }
}
