'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Save,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  CheckCircle,
  Calendar,
  ArrowLeft,
} from 'lucide-react';

interface Question {
  id: string;
  questionText: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correctOption: number;
  sectionId: string;
  sectionName?: string;
  topicId?: string;
  topicName?: string;
  difficultyLevel: 'easy' | 'medium' | 'hard';
}

interface SelectedQuestion extends Question {
  testQuestionId?: string;
  marks: number;
  questionOrder: number;
}

interface Section {
  id: string;
  name: string;
  approvedCount?: number;
}

interface SectionPattern {
  sectionId: string;
  sectionName: string;
  questionCount: number;
}

interface TestFormData {
  title: string;
  description: string;
  testType: 'mock' | 'live' | 'sectional' | 'practice';
  duration: number;
  negativeMarking: boolean;
  negativeMarkingValue: number;
  isPublished: boolean;
  isFree: boolean;
  instructions: string;
  scheduledAt: string;
}

export default function TestBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const testId = searchParams.get('id');
  const isEditMode = !!testId;

  const [loading, setLoading] = useState(isEditMode); // Start loading if editing
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<TestFormData>({
    title: '',
    description: '',
    testType: 'mock',
    duration: 180,
    negativeMarking: false,
    negativeMarkingValue: 0,
    isPublished: false,
    isFree: false,
    instructions: '',
    scheduledAt: '',
  });

  const [selectedQuestions, setSelectedQuestions] = useState<SelectedQuestion[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sectionPatterns, setSectionPatterns] = useState<SectionPattern[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const init = async () => {
      const loadedSections = await fetchSections();
      if (isEditMode && loadedSections) {
        await loadTest(loadedSections);
      }
    };
    init();
  }, [testId]);

  const fetchSections = async (): Promise<Section[]> => {
    try {
      const response = await fetch('/api/admin/sections');
      if (response.ok) {
        const data = await response.json();
        
        // Fetch approved question count per section
        const sectionsWithCounts = await Promise.all(
          (data.sections || []).map(async (section: Section) => {
            try {
              const countRes = await fetch(
                `/api/admin/questions/verify?sectionId=${section.id}&status=approved&limit=1`
              );
              if (!countRes.ok) {
                return {
                  ...section,
                  approvedCount: 0,
                };
              }
              const countData = await countRes.json();
              return {
                ...section,
                approvedCount: countData.pagination?.total || 0,
              };
            } catch (error) {
              console.error(`Error fetching count for section ${section.id}:`, error);
              return {
                ...section,
                approvedCount: 0,
              };
            }
          })
        );
        
        setSections(sectionsWithCounts);
        return sectionsWithCounts;
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
    return [];
  };

  const loadTest = async (loadedSections: Section[]) => {
    if (!testId) return;

    setLoading(true);
    try {
      const [testResponse, questionsResponse] = await Promise.all([
        fetch(`/api/admin/tests/${testId}`),
        fetch(`/api/admin/tests/${testId}/questions`),
      ]);

      if (!testResponse.ok || !questionsResponse.ok) {
        throw new Error('Failed to load test');
      }

      const test = await testResponse.json();
      const questionsData = await questionsResponse.json();

      setFormData({
        title: test.title,
        description: test.description || '',
        testType: test.testType,
        duration: test.duration,
        negativeMarking: test.negativeMarking,
        negativeMarkingValue: test.negativeMarkingValue,
        isPublished: test.isPublished,
        isFree: test.isFree,
        instructions: test.instructions || '',
        scheduledAt: test.scheduledAt || '',
      });

      // Load section patterns if it's a pattern-based test
      if (test.testPattern && typeof test.testPattern === 'object') {
        const patterns: SectionPattern[] = [];
        for (const [sectionId, count] of Object.entries(test.testPattern)) {
          const section = loadedSections.find(s => s.id === sectionId);
          patterns.push({
            sectionId,
            sectionName: section?.name || 'Unknown Section',
            questionCount: count as number,
          });
        }
        setSectionPatterns(patterns);
      }

      setSelectedQuestions(
        questionsData.questions.map((q: any) => ({
          id: q.questionId,
          testQuestionId: q.id,
          questionText: q.questionText,
          option1: q.option1,
          option2: q.option2,
          option3: q.option3,
          option4: q.option4,
          correctOption: q.correctOption,
          sectionId: q.sectionId,
          sectionName: q.sectionName,
          topicId: q.topicId,
          difficultyLevel: q.difficultyLevel,
          marks: q.marks,
          questionOrder: q.questionOrder,
        }))
      );
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load test',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Section pattern helpers
  const addSectionPattern = () => {
    if (sections.length === 0) return;
    
    const unusedSection = sections.find(
      s => !sectionPatterns.some(sp => sp.sectionId === s.id)
    );
    
    if (unusedSection) {
      setSectionPatterns([
        ...sectionPatterns,
        {
          sectionId: unusedSection.id,
          sectionName: unusedSection.name,
          questionCount: 10,
        },
      ]);
    }
  };

  const updateSectionPattern = (index: number, field: 'sectionId' | 'questionCount', value: string | number) => {
    const updated = [...sectionPatterns];
    const current = updated[index];
    if (!current) return;
    
    if (field === 'sectionId') {
      const section = sections.find(s => s.id === value);
      updated[index] = {
        sectionId: value as string,
        sectionName: section?.name || '',
        questionCount: current.questionCount,
      };
    } else {
      updated[index] = {
        sectionId: current.sectionId,
        sectionName: current.sectionName,
        questionCount: Number(value),
      };
    }
    setSectionPatterns(updated);
  };

  const removeSectionPattern = (index: number) => {
    setSectionPatterns(sectionPatterns.filter((_, i) => i !== index));
  };

  const getTotalQuestionsFromPattern = () => {
    return sectionPatterns.reduce((sum, sp) => sum + sp.questionCount, 0);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSelectedQuestions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        return newItems.map((item, index) => ({
          ...item,
          questionOrder: index + 1,
        }));
      });
    }
  };

  const removeQuestion = (questionId: string) => {
    setSelectedQuestions((prev) =>
      prev.filter((q) => q.id !== questionId).map((q, index) => ({
        ...q,
        questionOrder: index + 1,
      }))
    );
  };

  const updateQuestionMarks = (questionId: string, marks: number) => {
    setSelectedQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, marks } : q))
    );
  };

  const calculateTotals = () => {
    const totalQuestions = selectedQuestions.length;
    const totalMarks = selectedQuestions.reduce((sum, q) => sum + q.marks, 0);
    const sectionBreakdown = selectedQuestions.reduce((acc, q) => {
      const sectionName = q.sectionName || 'Unassigned';
      if (!acc[sectionName]) {
        acc[sectionName] = { count: 0, marks: 0 };
      }
      acc[sectionName].count++;
      acc[sectionName].marks += q.marks;
      return acc;
    }, {} as Record<string, { count: number; marks: number }>);

    return { totalQuestions, totalMarks, sectionBreakdown };
  };

  const handleSave = async (publish: boolean = false) => {
    if (!formData.title) {
      toast({
        title: 'Validation Error',
        description: 'Test title is required',
        variant: 'destructive',
      });
      return;
    }

    const isPatternBased = formData.testType === 'mock' || formData.testType === 'live';

    if (isPatternBased && sectionPatterns.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please add at least one section pattern',
        variant: 'destructive',
      });
      return;
    }

    if (!isPatternBased && selectedQuestions.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please add at least one question to the test',
        variant: 'destructive',
      });
      return;
    }

    // Validate section patterns have enough questions
    if (isPatternBased) {
      for (const pattern of sectionPatterns) {
        const section = sections.find(s => s.id === pattern.sectionId);
        if (section && pattern.questionCount > (section.approvedCount || 0)) {
          toast({
            title: 'Validation Error',
            description: `${section.name} has only ${section.approvedCount} approved questions, but you requested ${pattern.questionCount}`,
            variant: 'destructive',
          });
          return;
        }
      }
    }

    return await saveTest();
  };

  const handlePreview = async () => {
    if (isEditMode) {
      // For edit mode, just navigate to preview to view existing questions
      router.push(`/admin/tests/builder/preview?id=${testId}`);
    } else {
      // For create mode, save as draft first then navigate
      const savedId = await handleSave(false);
      if (savedId) {
        router.push(`/admin/tests/builder/preview?id=${savedId}`);
      }
    }
  };

  const saveTest = async () => {
    const isPatternBased = formData.testType === 'mock' || formData.testType === 'live';

    setSaving(true);
    try {
      const totalQuestions = isPatternBased 
        ? getTotalQuestionsFromPattern()
        : selectedQuestions.length;
      const totalMarks = isPatternBased
        ? getTotalQuestionsFromPattern() // 1 mark per question for pattern-based
        : selectedQuestions.reduce((sum, q) => sum + q.marks, 0);

      const testData = {
        ...formData,
        totalQuestions,
        totalMarks,
        isPublished: false, // Always save as draft
        testPattern: isPatternBased ? Object.fromEntries(
          sectionPatterns.map(sp => [sp.sectionId, sp.questionCount])
        ) : null,
      };

      let savedTestId = testId;

      if (isEditMode) {
        // Update existing test
        const response = await fetch(`/api/admin/tests/${testId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testData),
        });

        if (!response.ok) throw new Error('Failed to update test');
      } else {
        // Create new test
        const response = await fetch('/api/admin/tests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testData),
        });

        if (!response.ok) throw new Error('Failed to create test');

        const data = await response.json();
        savedTestId = data.test.id;
      }

      // For pattern-based tests, generate random questions
      if (savedTestId && isPatternBased && !isEditMode) {
        const generateResponse = await fetch(`/api/admin/tests/${savedTestId}/generate-questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sectionPatterns: sectionPatterns.map(sp => ({
              sectionId: sp.sectionId,
              count: sp.questionCount,
            })),
          }),
        });

        if (!generateResponse.ok) {
          const error = await generateResponse.json();
          throw new Error(error.error || 'Failed to generate questions');
        }
      }

      // For manual tests, save selected questions
      if (savedTestId && !isPatternBased) {
        if (isEditMode) {
          const response = await fetch(
            `/api/admin/tests/${savedTestId}/questions/reorder`,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                questionOrders: selectedQuestions.map((q) => ({
                  id: q.testQuestionId!,
                  questionOrder: q.questionOrder,
                })),
              }),
            }
          );

          if (!response.ok) throw new Error('Failed to reorder questions');
        } else {
          // Add questions to new test
          const response = await fetch(`/api/admin/tests/${savedTestId}/questions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              questions: selectedQuestions.map((q) => ({
                questionId: q.id,
                marks: q.marks,
                sectionId: q.sectionId,
              })),
            }),
          });

          if (!response.ok) throw new Error('Failed to add questions');
        }
      }

      toast({
        title: 'Success',
        description: 'Test saved as draft successfully',
      });

      return savedTestId;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save test',
        variant: 'destructive',
      });
      return null;
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-80" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Test Configuration Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <Skeleton className="h-7 w-32 mb-4" />
              
              <div className="space-y-4">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>

                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-20 w-full" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>

                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-24 w-full" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-11 rounded-full" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-52" />
                    </div>
                    <Skeleton className="h-6 w-11 rounded-full" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-7 w-56" />
                <Skeleton className="h-10 w-32" />
              </div>

              <div className="space-y-4">
                <div className="text-center py-12">
                  <Skeleton className="h-5 w-48 mx-auto mb-2" />
                  <Skeleton className="h-4 w-64 mx-auto" />
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Preview Skeleton */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <Skeleton className="h-6 w-32 mb-6" />

              <div className="space-y-4">
                <div>
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-8 w-16" />
                </div>

                <div>
                  <Skeleton className="h-4 w-28 mb-1" />
                  <Skeleton className="h-8 w-16" />
                </div>

                <div>
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-6 w-28" />
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom Action Bar Skeleton */}
        <Card className="p-6 sticky bottom-0 bg-background border-t">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-64" />
            <div className="flex gap-3">
              <Skeleton className="h-11 w-32" />
              <Skeleton className="h-11 w-40" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const { totalQuestions, totalMarks, sectionBreakdown } = calculateTotals();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/admin/tests')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditMode ? 'Edit Test' : 'Create New Test'}
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure test details and add approved questions
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Test Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Test Details</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Test Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., RRB NTPC Mock Test - 1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of the test..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="testType">Test Type *</Label>
                  <Select
                    value={formData.testType}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, testType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mock">Mock Test</SelectItem>
                      <SelectItem value="live">Live Test</SelectItem>
                      <SelectItem value="sectional">Sectional</SelectItem>
                      <SelectItem value="practice">Practice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })
                    }
                    min="1"
                  />
                </div>
              </div>

              {formData.testType === 'live' && (
                <div>
                  <Label htmlFor="scheduledAt">Scheduled Date & Time</Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduledAt: e.target.value })
                    }
                  />
                </div>
              )}

              <div>
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) =>
                    setFormData({ ...formData, instructions: e.target.value })
                  }
                  placeholder="Test instructions for students..."
                  rows={4}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Negative Marking</Label>
                    <p className="text-sm text-muted-foreground">
                      Deduct marks for incorrect answers
                    </p>
                  </div>
                  <Switch
                    checked={formData.negativeMarking}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, negativeMarking: checked })
                    }
                  />
                </div>

                {formData.negativeMarking && (
                  <div>
                    <Label htmlFor="negativeMarkingValue">
                      Negative Marking Value (basis points, e.g., -25 = -0.25 marks)
                    </Label>
                    <Input
                      id="negativeMarkingValue"
                      type="number"
                      value={formData.negativeMarkingValue}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          negativeMarkingValue: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="-25"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Free Access</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow all users to access this test
                    </p>
                  </div>
                  <Switch
                    checked={formData.isFree}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isFree: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Section Pattern (for Mock/Live Tests) */}
          {(formData.testType === 'mock' || formData.testType === 'live') && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Section-wise Distribution</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Define how many questions to randomly select from each section
                  </p>
                </div>
                <Button onClick={addSectionPattern} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
              </div>

              {sectionPatterns.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No sections added yet</p>
                  <p className="text-sm mt-1">Click "Add Section" to define question distribution</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sectionPatterns.map((pattern, index) => {
                    const section = sections.find(s => s.id === pattern.sectionId);
                    return (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                        
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Section</Label>
                            <Select
                              value={pattern.sectionId}
                              onValueChange={(value) => updateSectionPattern(index, 'sectionId', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {sections.map((sec) => (
                                  <SelectItem 
                                    key={sec.id} 
                                    value={sec.id}
                                    disabled={sectionPatterns.some(sp => sp.sectionId === sec.id && sp.sectionId !== pattern.sectionId)}
                                  >
                                    {sec.name}
                                    <span className="text-xs text-muted-foreground ml-2">
                                      ({sec.approvedCount || 0} approved)
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Questions</Label>
                            <Input
                              type="number"
                              value={pattern.questionCount}
                              onChange={(e) => updateSectionPattern(index, 'questionCount', e.target.value)}
                              min="1"
                              max={section?.approvedCount || 999}
                            />
                          </div>
                        </div>

                        <Badge variant="secondary">
                          {pattern.questionCount} {pattern.questionCount === 1 ? 'mark' : 'marks'}
                        </Badge>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSectionPattern(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    );
                  })}

                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Total Questions:</span>
                      <span className="text-lg font-bold">{getTotalQuestionsFromPattern()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="font-medium">Total Marks:</span>
                      <span className="text-lg font-bold">{getTotalQuestionsFromPattern()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Questions will be randomly selected from approved questions when you save the test
                    </p>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Questions Section (for Practice/Sectional Tests) */}
          {(formData.testType === 'practice' || formData.testType === 'sectional') && (
            <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Questions ({selectedQuestions.length})</h2>
              <QuestionPicker
                sections={sections}
                selectedQuestions={selectedQuestions}
                onQuestionsSelected={(questions) => {
                  const newQuestions = questions.map((q, index) => ({
                    ...q,
                    marks: 1,
                    questionOrder: selectedQuestions.length + index + 1,
                  }));
                  setSelectedQuestions([...selectedQuestions, ...newQuestions]);
                }}
              />
            </div>

            {selectedQuestions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No questions added yet</p>
                <p className="text-sm mt-1">Click "Add Questions" to get started</p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={selectedQuestions.map((q) => q.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {selectedQuestions.map((question) => (
                      <SortableQuestionItem
                        key={question.id}
                        question={question}
                        onRemove={removeQuestion}
                        onUpdateMarks={updateQuestionMarks}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </Card>
          )}
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-6">
          <Card className="p-6 sticky top-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Test Preview
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Questions</p>
                <p className="text-2xl font-bold">{totalQuestions}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Total Marks</p>
                <p className="text-2xl font-bold">{totalMarks}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-xl font-semibold">{formData.duration} minutes</p>
              </div>

              {Object.keys(sectionBreakdown).length > 0 && (
                <>
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-2">Section Breakdown</p>
                    <div className="space-y-2">
                      {Object.entries(sectionBreakdown).map(([section, data]) => (
                        <div key={section} className="flex justify-between text-sm">
                          <span>{section}</span>
                          <span className="font-medium">
                            {data.count} Qs | {data.marks} Marks
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="border-t pt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Negative Marking</span>
                  <Badge variant={formData.negativeMarking ? 'destructive' : 'secondary'}>
                    {formData.negativeMarking
                      ? `Yes (${formData.negativeMarkingValue / 100})`
                      : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Access</span>
                  <Badge variant={formData.isFree ? 'default' : 'secondary'}>
                    {formData.isFree ? 'Free' : 'Premium'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Type</span>
                  <Badge>{formData.testType}</Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <Card className="p-6 sticky bottom-0 bg-background border-t">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {totalQuestions > 0 ? (
              <span>
                <strong>{totalQuestions}</strong> questions selected | <strong>{totalMarks}</strong> total marks
              </span>
            ) : (
              <span>No questions selected yet</span>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={saving || !formData.title}
              size="lg"
            >
              {saving ? <Spinner className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
              Save Draft
            </Button>
            <Button
              onClick={handlePreview}
              disabled={saving || !formData.title || (!isEditMode && (formData.testType === 'mock' || formData.testType === 'live' ? sectionPatterns.length === 0 : selectedQuestions.length === 0))}
              size="lg"
            >
              {isEditMode ? (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  View Questions
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Generate Questions
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Sortable Question Item Component
function SortableQuestionItem({
  question,
  onRemove,
  onUpdateMarks,
}: {
  question: SelectedQuestion;
  onRemove: (id: string) => void;
  onUpdateMarks: (id: string, marks: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-3 p-4 border rounded-lg bg-card"
    >
      <button
        className="mt-1 cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="font-medium text-sm">{question.questionText}</p>
            <div className="flex gap-2 mt-1">
              {question.sectionName && (
                <Badge variant="outline" className="text-xs">
                  {question.sectionName}
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs">
                {question.difficultyLevel}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor={`marks-${question.id}`} className="text-xs">
                Marks:
              </Label>
              <Input
                id={`marks-${question.id}`}
                type="number"
                min="1"
                value={question.marks}
                onChange={(e) =>
                  onUpdateMarks(question.id, parseInt(e.target.value) || 1)
                }
                className="w-16 h-8 text-sm"
              />
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRemove(question.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Question Picker Dialog Component  
function QuestionPicker({
  sections,
  selectedQuestions,
  onQuestionsSelected,
}: {
  sections: Section[];
  selectedQuestions: SelectedQuestion[];
  onQuestionsSelected: (questions: Question[]) => void;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sectionFilter, setSectionFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (open) {
      fetchQuestions();
    }
  }, [open, sectionFilter, difficultyFilter, page]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (sectionFilter !== 'all') params.append('sectionId', sectionFilter);
      if (difficultyFilter !== 'all') params.append('difficulty', difficultyFilter);

      const response = await fetch(`/api/admin/questions/approved?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch approved questions');
      }

      const data = await response.json();
      
      // Filter out already selected questions
      const alreadySelectedIds = new Set(selectedQuestions.map((q) => q.id));
      const availableQuestions = data.questions.filter(
        (q: Question) => !alreadySelectedIds.has(q.id)
      );
      
      setQuestions(availableQuestions);
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

  const handleAdd = () => {
    const questionsToAdd = questions.filter((q) => selectedIds.has(q.id));
    onQuestionsSelected(questionsToAdd);
    setSelectedIds(new Set());
    setOpen(false);
    toast({
      title: 'Success',
      description: `Added ${questionsToAdd.length} question(s) to test`,
    });
  };

  const toggleQuestion = (questionId: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(questionId)) {
      newSelection.delete(questionId);
    } else {
      newSelection.add(questionId);
    }
    setSelectedIds(newSelection);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Questions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Questions to Test</DialogTitle>
          <DialogDescription>
            Select approved questions to add to your test
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-4">
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

          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner className="h-6 w-6" />
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No approved questions available</p>
            </div>
          ) : (
            <>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {questions.map((question) => (
                  <div
                    key={question.id}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggleQuestion(question.id)}
                  >
                    <Checkbox
                      checked={selectedIds.has(question.id)}
                      onCheckedChange={() => toggleQuestion(question.id)}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{question.questionText}</p>
                      <div className="flex gap-2 mt-1">
                        {question.sectionName && (
                          <Badge variant="outline" className="text-xs">
                            {question.sectionName}
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {question.difficultyLevel}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-2 text-sm">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    size="sm"
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

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={selectedIds.size === 0}>
              Add Selected ({selectedIds.size})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
