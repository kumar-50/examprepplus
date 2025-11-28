'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, ArrowLeft, Edit2, X, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

interface Question {
  id: string;
  questionText: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correctOption: number;
  sectionId: string;
  sectionName: string;
  marks: number;
  questionOrder: number;
}

interface SectionQuestions {
  sectionId: string;
  sectionName: string;
  questions: Question[];
  totalMarks: number;
}

interface TestData {
  id: string;
  title: string;
  description: string;
  testType: string;
  duration: number;
  totalQuestions: number;
  totalMarks: number;
  negativeMarking: boolean;
  negativeMarkingValue: number;
  isPublished: boolean;
}

export default function TestPreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const testId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [test, setTest] = useState<TestData | null>(null);
  const [sectionQuestions, setSectionQuestions] = useState<SectionQuestions[]>([]);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Question | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (testId) {
      loadTestData();
    }
  }, [testId]);

  const loadTestData = async () => {
    if (!testId) return;

    setLoading(true);
    try {
      const [testResponse, questionsResponse] = await Promise.all([
        fetch(`/api/admin/tests/${testId}`),
        fetch(`/api/admin/tests/${testId}/questions`),
      ]);

      if (!testResponse.ok || !questionsResponse.ok) {
        throw new Error('Failed to load test data');
      }

      const testData = await testResponse.json();
      const questionsData = await questionsResponse.json();

      setTest(testData);

      // Group questions by section
      const grouped: Record<string, SectionQuestions> = {};
      
      questionsData.questions.forEach((q: any) => {
        const sectionKey = q.sectionId;
        if (!grouped[sectionKey]) {
          grouped[sectionKey] = {
            sectionId: q.sectionId,
            sectionName: q.sectionName,
            questions: [],
            totalMarks: 0,
          };
        }
        
        grouped[sectionKey].questions.push({
          id: q.questionId,
          questionText: q.questionText,
          option1: q.option1,
          option2: q.option2,
          option3: q.option3,
          option4: q.option4,
          correctOption: q.correctOption,
          sectionId: q.sectionId,
          sectionName: q.sectionName,
          marks: q.marks,
          questionOrder: q.questionOrder,
        });
        grouped[sectionKey].totalMarks += q.marks;
      });

      setSectionQuestions(Object.values(grouped));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load test data',
        variant: 'destructive',
      });
      router.push('/admin/tests/builder');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!testId || !test) return;

    setPublishing(true);
    try {
      const response = await fetch(`/api/admin/tests/${testId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isPublished: true,
        }),
      });

      if (!response.ok) {
        throw new Error(test.isPublished ? 'Failed to update test' : 'Failed to create test');
      }

      toast({
        title: 'Success',
        description: test.isPublished ? 'Test updated successfully!' : 'Test created and published successfully!',
      });

      router.push('/admin/tests');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || (test.isPublished ? 'Failed to update test' : 'Failed to create test'),
        variant: 'destructive',
      });
    } finally {
      setPublishing(false);
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestionId(question.id);
    setEditForm({ ...question });
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    setEditForm(null);
  };

  const handleSaveQuestion = async () => {
    if (!editForm || !testId) return;

    // Validate form
    if (!editForm.questionText.trim()) {
      toast({
        title: 'Error',
        description: 'Question text is required',
        variant: 'destructive',
      });
      return;
    }

    if (!editForm.option1.trim() || !editForm.option2.trim() || 
        !editForm.option3.trim() || !editForm.option4.trim()) {
      toast({
        title: 'Error',
        description: 'All options are required',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/tests/${testId}/questions/${editForm.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: editForm.questionText,
          option1: editForm.option1,
          option2: editForm.option2,
          option3: editForm.option3,
          option4: editForm.option4,
          correctOption: editForm.correctOption,
          marks: editForm.marks,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update question');
      }

      // Update local state
      setSectionQuestions(prev => 
        prev.map(section => ({
          ...section,
          questions: section.questions.map(q => 
            q.id === editForm.id ? editForm : q
          ),
          totalMarks: section.questions.reduce((sum, q) => 
            sum + (q.id === editForm.id ? editForm.marks : q.marks), 0
          ),
        }))
      );

      // Update test total marks if changed
      if (test) {
        const oldQuestion = sectionQuestions
          .flatMap(s => s.questions)
          .find(q => q.id === editForm.id);
        
        if (oldQuestion && oldQuestion.marks !== editForm.marks) {
          setTest({
            ...test,
            totalMarks: test.totalMarks - oldQuestion.marks + editForm.marks,
          });
        }
      }

      toast({
        title: 'Success',
        description: 'Question updated successfully',
      });

      setEditingQuestionId(null);
      setEditForm(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update question',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-20">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <Skeleton className="h-9 w-80" />
              <Skeleton className="h-5 w-96" />
            </div>
          </div>
          <Skeleton className="h-10 w-28" />
        </div>

        {/* Test Info Card Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-5 w-full" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-6 w-28" />
              </div>
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-6 w-16" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions Card Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-48" />
          </CardHeader>
          <CardContent>
            {/* Tabs Skeleton */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>

              {/* Section Header Skeleton */}
              <div className="flex items-center justify-between mb-4 mt-6">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-6 w-48" />
              </div>

              {/* Question Cards Skeleton */}
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Skeleton className="h-6 w-12" />
                              <Skeleton className="h-6 w-16" />
                            </div>
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-3/4 mt-2" />
                          </div>
                        </div>

                        <div className="grid gap-2">
                          {[1, 2, 3, 4].map((j) => (
                            <Skeleton key={j} className="h-12 w-full" />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!test) {
    return null;
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Review Generated Questions</h1>
            <p className="text-muted-foreground">Review all questions before creating the test</p>
          </div>
        </div>
        <div>
          <Button
            variant="default"
            size="icon"
            onClick={() => router.push(`/admin/tests/builder?id=${testId}`)}
            className='w-full p-4'
          >
            <ArrowLeft className="h-5 w-5" />
              Back
          </Button>
        </div>
      </div>

      {/* Test Info */}
      <Card>
        <CardHeader>
          <CardTitle>{test.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {test.description && (
            <p className="text-muted-foreground">{test.description}</p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Test Type</p>
              <p className="font-medium capitalize">{test.testType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-medium">{test.duration} minutes</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Questions</p>
              <p className="font-medium">{test.totalQuestions}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Marks</p>
              <p className="font-medium">{test.totalMarks}</p>
            </div>
          </div>
          {test.negativeMarking && (
            <Alert>
              <AlertTitle>Negative Marking</AlertTitle>
              <AlertDescription>
                {test.negativeMarkingValue} mark(s) will be deducted for each incorrect answer
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Questions by Section */}
      <Card>
        <CardHeader>
          <CardTitle>Questions ({test.totalQuestions})</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={sectionQuestions[0]?.sectionId ?? ''}>
            <TabsList className="w-full grid" style={{ gridTemplateColumns: `repeat(${sectionQuestions.length}, 1fr)` }}>
              {sectionQuestions.map((section) => (
                <TabsTrigger key={section.sectionId} value={section.sectionId}>
                  {section.sectionName}
                  <Badge variant="outline" className="ml-2">
                    {section.questions.length}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            {sectionQuestions.map((section) => (
              <TabsContent key={section.sectionId} value={section.sectionId} className="space-y-4 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{section.sectionName}</h3>
                  <Badge>
                    {section.questions.length} Questions | {section.totalMarks} Marks
                  </Badge>
                </div>

                <div className="space-y-6">
                  {section.questions
                    .sort((a, b) => a.questionOrder - b.questionOrder)
                    .map((question, index) => {
                      const isEditing = editingQuestionId === question.id;
                      const displayQuestion = isEditing && editForm ? editForm : question;

                      return (
                        <Card key={question.id} className={isEditing ? 'border-primary' : ''}>
                          <CardContent className="p-6">
                            {isEditing && editForm ? (
                              // Edit Mode
                              <div className="space-y-4">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">Q{index + 1}</Badge>
                                    <Badge variant="secondary">Editing</Badge>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={handleCancelEdit}
                                      disabled={saving}
                                    >
                                      <X className="h-4 w-4 mr-1" />
                                      Cancel
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={handleSaveQuestion}
                                      disabled={saving}
                                    >
                                      {saving ? (
                                        <Spinner className="h-4 w-4 mr-1" />
                                      ) : (
                                        <Save className="h-4 w-4 mr-1" />
                                      )}
                                      Save
                                    </Button>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <div>
                                    <Label htmlFor="questionText">Question Text</Label>
                                    <Input
                                      id="questionText"
                                      value={editForm.questionText}
                                      onChange={(e) => setEditForm({ ...editForm, questionText: e.target.value })}
                                      className="mt-1"
                                      placeholder="Enter question text"
                                    />
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                      <Label htmlFor="option1">Option A</Label>
                                      <Input
                                        id="option1"
                                        value={editForm.option1}
                                        onChange={(e) => setEditForm({ ...editForm, option1: e.target.value })}
                                        className="mt-1"
                                        placeholder="Option A"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="option2">Option B</Label>
                                      <Input
                                        id="option2"
                                        value={editForm.option2}
                                        onChange={(e) => setEditForm({ ...editForm, option2: e.target.value })}
                                        className="mt-1"
                                        placeholder="Option B"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="option3">Option C</Label>
                                      <Input
                                        id="option3"
                                        value={editForm.option3}
                                        onChange={(e) => setEditForm({ ...editForm, option3: e.target.value })}
                                        className="mt-1"
                                        placeholder="Option C"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="option4">Option D</Label>
                                      <Input
                                        id="option4"
                                        value={editForm.option4}
                                        onChange={(e) => setEditForm({ ...editForm, option4: e.target.value })}
                                        className="mt-1"
                                        placeholder="Option D"
                                      />
                                    </div>
                                  </div>

                                  <div className="flex gap-4">
                                    <div className="flex-1">
                                      <Label>Correct Answer</Label>
                                      <RadioGroup
                                        value={editForm.correctOption.toString()}
                                        onValueChange={(value) => setEditForm({ ...editForm, correctOption: parseInt(value) })}
                                        className="flex gap-4 mt-2"
                                      >
                                        <div className="flex items-center space-x-2">
                                          <RadioGroupItem value="1" id="correct-1" />
                                          <Label htmlFor="correct-1" className="font-normal">A</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <RadioGroupItem value="2" id="correct-2" />
                                          <Label htmlFor="correct-2" className="font-normal">B</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <RadioGroupItem value="3" id="correct-3" />
                                          <Label htmlFor="correct-3" className="font-normal">C</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <RadioGroupItem value="4" id="correct-4" />
                                          <Label htmlFor="correct-4" className="font-normal">D</Label>
                                        </div>
                                      </RadioGroup>
                                    </div>
                                    <div className="w-32">
                                      <Label htmlFor="marks">Marks</Label>
                                      <Input
                                        id="marks"
                                        type="number"
                                        min="0"
                                        value={editForm.marks}
                                        onChange={(e) => setEditForm({ ...editForm, marks: parseInt(e.target.value) || 0 })}
                                        className="mt-1"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              // View Mode
                              <div className="space-y-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge variant="outline">Q{index + 1}</Badge>
                                      <Badge variant="secondary">{question.marks} mark{question.marks > 1 ? 's' : ''}</Badge>
                                    </div>
                                    <p className="text-base font-medium">{question.questionText}</p>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditQuestion(question)}
                                    disabled={editingQuestionId !== null}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                </div>

                                <div className="grid gap-2">
                                  {[
                                    { label: 'A', text: question.option1, value: 1 },
                                    { label: 'B', text: question.option2, value: 2 },
                                    { label: 'C', text: question.option3, value: 3 },
                                    { label: 'D', text: question.option4, value: 4 },
                                  ].map((option) => (
                                    <div
                                      key={option.value}
                                      className={`p-3 rounded-lg border ${
                                        option.value === question.correctOption
                                          ? 'border-green-500 bg-green-100 dark:bg-green-900/30 font-medium'
                                          : 'border-border'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">{option.label}.</span>
                                        <span>{option.text}</span>
                                        {option.value === question.correctOption && (
                                          <CheckCircle className="ml-auto h-4 w-4 text-green-600" />
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Bottom Action Bar */}
      <Card className="py-1 fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 shadow-lg ml-[var(--sidebar-width,0px)]">
        <CardContent className="p-2">
          <div className="mx-auto flex items-center justify-between max-w-[1400px] px-4">
            <div className="text-sm text-muted-foreground">
              <strong>{test.totalQuestions}</strong> questions | <strong>{test.totalMarks}</strong> marks
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/tests/builder?id=${testId}`)}
                size="lg"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Edit
              </Button>
              <Button
                onClick={handlePublish}
                disabled={publishing}
                size="lg"
              >
                {publishing ? (
                  <Spinner className="mr-2 h-4 w-4" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                {publishing ? (test.isPublished ? 'Updating...' : 'Creating...') : (test.isPublished ? 'Update Test' : 'Create Test')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
