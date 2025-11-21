'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { createQuestionColumns, Question } from './columns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Upload, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Eye,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CSVUploadComponent } from '@/components/admin/csv-upload';

interface Section {
  id: string;
  name: string;
}

interface Topic {
  id: string;
  name: string;
  sectionId: string;
}

interface QuestionFormData {
  questionText: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correctOption: number;
  explanation: string;
  sectionId: string;
  topicId: string;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  hasEquation: boolean;
  imageUrl: string;
  isActive: boolean;
  status?: 'pending' | 'approved' | 'rejected';
}

export default function QuestionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCSVSheetOpen, setIsCSVSheetOpen] = useState(false);
  const [isViewSheetOpen, setIsViewSheetOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [viewingQuestion, setViewingQuestion] = useState<Question | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Filters
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [filterSection, setFilterSection] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  const [formData, setFormData] = useState<QuestionFormData>({
    questionText: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctOption: 1,
    explanation: '',
    sectionId: '',
    topicId: '',
    difficultyLevel: 'medium',
    hasEquation: false,
    imageUrl: '',
    isActive: true,
    status: 'pending',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSections();
    fetchAllTopics();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [currentPage, activeTab, filterSection, filterTopic, filterDifficulty]);

  useEffect(() => {
    if (formData.sectionId) {
      const sectionTopics = allTopics.filter(t => t.sectionId === formData.sectionId);
      setTopics(sectionTopics);
    }
  }, [formData.sectionId, allTopics]);

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/admin/sections');
      if (!response.ok) throw new Error('Failed to fetch sections');
      const data = await response.json();
      setSections(data.sections);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load sections',
        variant: 'destructive',
      });
    }
  };

  const fetchAllTopics = async () => {
    try {
      const response = await fetch('/api/admin/topics');
      if (!response.ok) throw new Error('Failed to fetch topics');
      const data = await response.json();
      setAllTopics(data.topics);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load topics',
        variant: 'destructive',
      });
    }
  };

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });
      
      if (activeTab !== 'all') params.append('status', activeTab);
      if (filterSection) params.append('sectionId', filterSection);
      if (filterTopic) params.append('topicId', filterTopic);
      if (filterDifficulty) params.append('difficulty', filterDifficulty);

      const response = await fetch(`/api/admin/questions/verify?${params}`);
      if (!response.ok) throw new Error('Failed to fetch questions');
      
      const data = await response.json();
      setQuestions(data.questions || []);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load questions',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprovalToggle = async (questionId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'approved' ? 'rejected' : 'approved';
    const action = newStatus === 'approved' ? 'approve' : 'reject';
    
    // Optimistic update
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { ...q, status: newStatus as any, isVerified: newStatus === 'approved' }
        : q
    ));
    
    setProcessingId(questionId);
    try {
      const response = await fetch(`/api/admin/questions/verify/${questionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        // Revert on error
        setQuestions(prev => prev.map(q => 
          q.id === questionId 
            ? { ...q, status: currentStatus as any, isVerified: currentStatus === 'approved' }
            : q
        ));
        throw new Error('Failed to update status');
      }

      toast({
        title: 'Success',
        description: `Question ${action}ed successfully`,
      });
      
      // Revalidate from server
      fetchQuestions();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update question status',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenAddDialog = () => {
    setEditingQuestion(null);
    setFormData({
      questionText: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      correctOption: 1,
      explanation: '',
      sectionId: '',
      topicId: '',
      difficultyLevel: 'medium',
      hasEquation: false,
      imageUrl: '',
      isActive: true,
      status: 'pending',
    });
    setIsSheetOpen(true);
  };

  const handleOpenEditDialog = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      questionText: question.questionText,
      option1: question.option1,
      option2: question.option2,
      option3: question.option3,
      option4: question.option4,
      correctOption: question.correctOption,
      explanation: question.explanation || '',
      sectionId: question.sectionId,
      topicId: question.topicId || '',
      difficultyLevel: question.difficultyLevel,
      hasEquation: question.hasEquation,
      imageUrl: question.imageUrl || '',
      isActive: question.isActive,
      status: question.status,
    });
    setIsSheetOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingQuestion
        ? `/api/admin/questions/${editingQuestion.id}`
        : '/api/admin/questions';
      
      const method = editingQuestion ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          topicId: formData.topicId || null,
          explanation: formData.explanation || null,
          imageUrl: formData.imageUrl || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Save failed:', errorData);
        throw new Error(errorData?.error || 'Failed to save question');
      }

      toast({
        title: 'Success',
        description: `Question ${editingQuestion ? 'updated' : 'created'} successfully`,
      });

      setIsSheetOpen(false);
      fetchQuestions();
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save question',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    // Optimistic update
    const previousQuestions = questions;
    setQuestions(prev => prev.filter(q => q.id !== id));

    try {
      const response = await fetch(`/api/admin/questions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        // Revert on error
        setQuestions(previousQuestions);
        throw new Error('Failed to delete question');
      }

      toast({
        title: 'Success',
        description: 'Question deleted successfully',
      });

      // Revalidate from server
      fetchQuestions();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete question',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-500">Rejected</Badge>;
      default:
        return null;
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return 'bg-green-500/10 text-green-500';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500';
      case 'hard': return 'bg-red-500/10 text-red-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Questions</h1>
          <p className="text-muted-foreground mt-2">
            Manage your question bank - {total} questions total
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsCSVSheetOpen(true)} variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          <Button onClick={handleOpenAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Section</Label>
              <div className="flex gap-2">
                <Select 
                  {...(filterSection ? { value: filterSection } : {})}
                  onValueChange={(v) => setFilterSection(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All sections" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {filterSection && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilterSection('')}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
            <div>
              <Label>Topic</Label>
              <div className="flex gap-2">
                <Select 
                  {...(filterTopic ? { value: filterTopic } : {})}
                  onValueChange={(v) => setFilterTopic(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All topics" />
                  </SelectTrigger>
                  <SelectContent>
                    {allTopics
                      .filter(t => !filterSection || t.sectionId === filterSection)
                      .map((topic) => (
                        <SelectItem key={topic.id} value={topic.id}>
                          {topic.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {filterTopic && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilterTopic('')}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
            <div>
              <Label>Difficulty</Label>
              <div className="flex gap-2">
                <Select 
                  {...(filterDifficulty ? { value: filterDifficulty } : {})}
                  onValueChange={(v) => setFilterDifficulty(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All difficulties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
                {filterDifficulty && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilterDifficulty('')}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="all">All ({total})</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <DataTable
            columns={createQuestionColumns(
              (question) => {
                setViewingQuestion(question);
                setIsViewSheetOpen(true);
              },
              handleOpenEditDialog,
              handleDelete
            )}
            data={questions}
            loading={isLoading}
            manualPagination
            pageCount={totalPages}
            pageSize={pageSize}
            pageIndex={currentPage - 1}
            totalItems={total}
            onPaginationChange={(pagination) => {
              setCurrentPage(pagination.pageIndex + 1);
            }}
            storageKey="questions-table-state"
          />
        </TabsContent>
      </Tabs>

      {/* Add/Edit Question Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
            </SheetTitle>
            <SheetDescription>
              {editingQuestion ? 'Update the question details below' : 'Fill in the details to create a new question'}
            </SheetDescription>
          </SheetHeader>
          
          <form onSubmit={handleSubmit} className='px-4 py-1'>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="questionText">Question Text *</Label>
                <Textarea
                  id="questionText"
                  value={formData.questionText}
                  onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                  placeholder="Enter the question..."
                  required
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="option1">Option 1 *</Label>
                  <Input
                    id="option1"
                    value={formData.option1}
                    onChange={(e) => setFormData({ ...formData, option1: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="option2">Option 2 *</Label>
                  <Input
                    id="option2"
                    value={formData.option2}
                    onChange={(e) => setFormData({ ...formData, option2: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="option3">Option 3 *</Label>
                  <Input
                    id="option3"
                    value={formData.option3}
                    onChange={(e) => setFormData({ ...formData, option3: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="option4">Option 4 *</Label>
                  <Input
                    id="option4"
                    value={formData.option4}
                    onChange={(e) => setFormData({ ...formData, option4: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="correctOption">Correct Option (1-4) *</Label>
                  <Select
                    value={formData.correctOption.toString()}
                    onValueChange={(v) => setFormData({ ...formData, correctOption: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Option 1</SelectItem>
                      <SelectItem value="2">Option 2</SelectItem>
                      <SelectItem value="3">Option 3</SelectItem>
                      <SelectItem value="4">Option 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="difficultyLevel">Difficulty *</Label>
                  <Select
                    value={formData.difficultyLevel}
                    onValueChange={(v: any) => setFormData({ ...formData, difficultyLevel: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="explanation">Explanation (Optional)</Label>
                <Textarea
                  id="explanation"
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  placeholder="Provide an explanation for the correct answer..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sectionId">Section *</Label>
                  <Select
                    value={formData.sectionId}
                    onValueChange={(v) => setFormData({ ...formData, sectionId: v, topicId: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map((section) => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="topicId">Topic (Optional)</Label>
                  <div className="flex gap-2">
                    <Select
                      {...(formData.topicId ? { value: formData.topicId } : {})}
                      onValueChange={(v) => setFormData({ ...formData, topicId: v })}
                      disabled={!formData.sectionId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select topic" />
                      </SelectTrigger>
                      <SelectContent>
                        {topics.map((topic) => (
                          <SelectItem key={topic.id} value={topic.id}>
                            {topic.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.topicId && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData({ ...formData, topicId: '' })}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {editingQuestion && (
                <div className="space-y-3 pt-2 border-t">
                  <Label>Approval Status</Label>
                  {editingQuestion.verifiedBy && editingQuestion.verifiedAt && (
                    <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                      <p>Previously verified by: {editingQuestion.verifierName || 'Unknown'}</p>
                      <p>At: {new Date(editingQuestion.verifiedAt).toLocaleString()}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant={formData.status === 'pending' ? 'default' : 'outline'}
                      className="w-full"
                      onClick={() => setFormData({ ...formData, status: 'pending' })}
                    >
                      <span className="mr-2">⏳</span>
                      Pending
                    </Button>
                    <Button
                      type="button"
                      variant={formData.status === 'approved' ? 'default' : 'outline'}
                      className={formData.status === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}
                      onClick={() => setFormData({ ...formData, status: 'approved' })}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      type="button"
                      variant={formData.status === 'rejected' ? 'default' : 'outline'}
                      className={formData.status === 'rejected' ? 'bg-red-600 hover:bg-red-700' : ''}
                      onClick={() => setFormData({ ...formData, status: 'rejected' })}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                  {formData.status !== editingQuestion.status && (
                    <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                      <p className="font-medium">⚠️ Status Change Detected</p>
                      <p>Changing status will update verification tracking (verified by you, timestamp updated)</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Current status: {getStatusBadge(formData.status || 'pending')}
                  </p>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>

            <SheetFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingQuestion ? 'Update Question' : 'Create Question'
                )}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* View Question Sheet */}
      <Sheet open={isViewSheetOpen} onOpenChange={setIsViewSheetOpen}>
        <SheetContent className="sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Question Details</SheetTitle>
          </SheetHeader>
          {viewingQuestion && (
            <div className="space-y-4 py-4">
              <div>
                <Label>Question</Label>
                <p className="mt-1 text-sm">{viewingQuestion.questionText}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((num) => {
                  const optionKey = `option${num}` as keyof Question;
                  const isCorrect = viewingQuestion.correctOption === num;
                  return (
                    <div
                      key={num}
                      className={`p-3 rounded-lg border-2 ${
                        isCorrect
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-border bg-muted/30'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="font-semibold">{num}.</span>
                        <span className={isCorrect ? 'font-medium' : ''}>
                          {viewingQuestion[optionKey] as string}
                        </span>
                        {isCorrect && (
                          <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {viewingQuestion.explanation && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <p className="text-sm font-semibold mb-1 text-blue-600">Explanation:</p>
                  <p className="text-sm">{viewingQuestion.explanation}</p>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                {getStatusBadge(viewingQuestion.status)}
                <Badge className={getDifficultyColor(viewingQuestion.difficultyLevel)}>
                  {viewingQuestion.difficultyLevel}
                </Badge>
                {viewingQuestion.isActive ? (
                  <Badge variant="outline" className="bg-green-500/10 text-green-500">Active</Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-500/10 text-gray-500">Inactive</Badge>
                )}
              </div>

              {/* Verification Details */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <p className="text-sm font-semibold">Verification Details</p>
                <div className="text-xs space-y-1">
                  <p><span className="font-medium">Status:</span> {viewingQuestion.status}</p>
                  <p><span className="font-medium">Verified:</span> {viewingQuestion.isVerified ? 'Yes' : 'No'}</p>
                  {viewingQuestion.verifierName && (
                    <p><span className="font-medium">Verified by:</span> {viewingQuestion.verifierName}</p>
                  )}
                  {viewingQuestion.verifiedAt && (
                    <p><span className="font-medium">Verified at:</span> {new Date(viewingQuestion.verifiedAt).toLocaleString()}</p>
                  )}
                  {viewingQuestion.creatorName && (
                    <p><span className="font-medium">Created by:</span> {viewingQuestion.creatorName}</p>
                  )}
                  <p><span className="font-medium">Created at:</span> {new Date(viewingQuestion.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
          <SheetFooter className="mt-6">
            <Button onClick={() => setIsViewSheetOpen(false)}>Close</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* CSV Import Sheet */}
      <Sheet open={isCSVSheetOpen} onOpenChange={setIsCSVSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Import Questions from CSV</SheetTitle>
            <SheetDescription>
              Upload a CSV file to bulk import questions into the system
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <CSVUploadComponent />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
