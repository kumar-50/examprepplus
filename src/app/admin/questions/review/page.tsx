'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type QuestionStatus = 'pending' | 'approved' | 'rejected';

interface Question {
  id: string;
  questionText: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correctOption: number;
  explanation?: string;
  sectionId: string;
  topicId?: string;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  status: QuestionStatus;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  verifierName?: string;
  creatorName?: string;
  createdAt: string;
}

interface Section {
  id: string;
  name: string;
}

export default function QuestionReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [currentTab, setCurrentTab] = useState<QuestionStatus | 'all'>(
    (searchParams.get('status') as QuestionStatus) || 'pending'
  );
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchSections();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [currentTab, sectionFilter, difficultyFilter, page]);

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/admin/sections');
      if (response.ok) {
        const data = await response.json();
        setSections(data.sections || []);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (currentTab !== 'all') params.append('status', currentTab);
      if (sectionFilter !== 'all') params.append('sectionId', sectionFilter);
      if (difficultyFilter !== 'all') params.append('difficulty', difficultyFilter);

      const response = await fetch(`/api/admin/questions/verify?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }

      const data = await response.json();
      setQuestions(data.questions);
      setTotalPages(data.pagination.totalPages);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch questions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (questionId: string) => {
    try {
      const response = await fetch(`/api/admin/questions/verify/${questionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });

      if (!response.ok) throw new Error('Failed to approve question');

      toast({
        title: 'Success',
        description: 'Question approved successfully',
      });

      fetchQuestions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve question',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (questionId: string) => {
    try {
      const response = await fetch(`/api/admin/questions/verify/${questionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      });

      if (!response.ok) throw new Error('Failed to reject question');

      toast({
        title: 'Success',
        description: 'Question rejected successfully',
      });

      fetchQuestions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject question',
        variant: 'destructive',
      });
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject') => {
    if (selectedQuestions.size === 0) {
      toast({
        title: 'Warning',
        description: 'Please select at least one question',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/admin/questions/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionIds: Array.from(selectedQuestions),
          action,
        }),
      });

      if (!response.ok) throw new Error(`Failed to ${action} questions`);

      toast({
        title: 'Success',
        description: `Successfully ${action}ed ${selectedQuestions.size} question(s)`,
      });

      setSelectedQuestions(new Set());
      fetchQuestions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || `Failed to ${action} questions`,
        variant: 'destructive',
      });
    }
  };

  const toggleQuestionSelection = (questionId: string) => {
    const newSelection = new Set(selectedQuestions);
    if (newSelection.has(questionId)) {
      newSelection.delete(questionId);
    } else {
      newSelection.add(questionId);
    }
    setSelectedQuestions(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedQuestions.size === questions.length) {
      setSelectedQuestions(new Set());
    } else {
      setSelectedQuestions(new Set(questions.map((q) => q.id)));
    }
  };

  const getStatusBadge = (status: QuestionStatus) => {
    const variants = {
      pending: { variant: 'secondary' as const, icon: Clock, label: 'Pending' },
      approved: { variant: 'default' as const, icon: CheckCircle, label: 'Approved' },
      rejected: { variant: 'destructive' as const, icon: XCircle, label: 'Rejected' },
    };

    const { variant, icon: Icon, label } = variants[status];
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return (
      <Badge className={colors[difficulty as keyof typeof colors] || ''}>
        {difficulty}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Question Review</h1>
          <p className="text-muted-foreground mt-1">
            Review and approve questions before they can be used in tests
          </p>
        </div>
        {selectedQuestions.size > 0 && (
          <div className="flex gap-2">
            <Button
              variant="default"
              onClick={() => handleBulkAction('approve')}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve Selected ({selectedQuestions.size})
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleBulkAction('reject')}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject Selected ({selectedQuestions.size})
            </Button>
          </div>
        )}
      </div>

      <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as QuestionStatus | 'all')}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <div className="mt-4 flex gap-4">
          <Select value={sectionFilter} onValueChange={setSectionFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sections</SelectItem>
              {sections.map((section) => (
                <SelectItem key={section.id} value={section.id}>
                  {section.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value={currentTab} className="space-y-4 mt-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          ) : questions.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No questions found</p>
            </Card>
          ) : (
            <>
              {questions.length > 0 && (
                <div className="flex items-center gap-2 py-2">
                  <Checkbox
                    checked={selectedQuestions.size === questions.length}
                    onCheckedChange={toggleSelectAll}
                  />
                  <span className="text-sm text-muted-foreground">
                    Select all ({questions.length})
                  </span>
                </div>
              )}

              {questions.map((question) => (
                <Card key={question.id} className="p-6">
                  <div className="flex gap-4">
                    <Checkbox
                      checked={selectedQuestions.has(question.id)}
                      onCheckedChange={() => toggleQuestionSelection(question.id)}
                    />
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-lg">{question.questionText}</p>
                          <div className="flex gap-2 mt-2">
                            {getStatusBadge(question.status)}
                            {getDifficultyBadge(question.difficultyLevel)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {question.status !== 'approved' && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApprove(question.id)}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </Button>
                          )}
                          {question.status !== 'rejected' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(question.id)}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map((num) => {
                          const optionKey = `option${num}` as keyof Question;
                          const isCorrect = question.correctOption === num;
                          return (
                            <div
                              key={num}
                              className={`p-3 rounded-lg border ${
                                isCorrect
                                  ? 'bg-green-50 border-green-300 dark:bg-green-950 dark:border-green-700'
                                  : 'bg-muted/30'
                              }`}
                            >
                              <span className="font-medium mr-2">{num}.</span>
                              {question[optionKey] as string}
                              {isCorrect && (
                                <Badge variant="default" className="ml-2">
                                  Correct
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {question.explanation && (
                        <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                          <p className="text-sm font-medium mb-1">Explanation:</p>
                          <p className="text-sm">{question.explanation}</p>
                        </div>
                      )}

                      <div className="flex gap-4 text-sm text-muted-foreground">
                        {question.creatorName && (
                          <span>Created by: {question.creatorName}</span>
                        )}
                        {question.verifierName && (
                          <span>Verified by: {question.verifierName}</span>
                        )}
                        <span>
                          Created: {new Date(question.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
