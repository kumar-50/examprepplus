'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Clock,
  CheckCircle,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Test {
  id: string;
  title: string;
  description?: string;
  testType: 'mock' | 'live' | 'sectional' | 'practice';
  totalQuestions: number;
  totalMarks: number;
  duration: number;
  isPublished: boolean;
  isFree: boolean;
  questionCount: number;
  createdAt: string;
  scheduledAt?: string;
}

export default function TestsListPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [publishedFilter, setPublishedFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState<string | null>(null);
  const [viewQuestionsDialogOpen, setViewQuestionsDialogOpen] = useState(false);
  const [viewingTest, setViewingTest] = useState<Test | null>(null);
  const [testQuestions, setTestQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTests();
  }, [search, typeFilter, publishedFilter, page]);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (typeFilter !== 'all') params.append('testType', typeFilter);
      if (publishedFilter !== 'all') params.append('isPublished', publishedFilter);
      if (search) params.append('search', search);

      const response = await fetch(`/api/admin/tests?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch tests');
      }

      const data = await response.json();
      setTests(data.tests);
      setTotalPages(data.pagination.totalPages);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch tests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!testToDelete) return;

    try {
      const response = await fetch(`/api/admin/tests/${testToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete test');

      toast({
        title: 'Success',
        description: 'Test deleted successfully',
      });

      setDeleteDialogOpen(false);
      setTestToDelete(null);
      fetchTests();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete test',
        variant: 'destructive',
      });
    }
  };

  const handleTogglePublish = async (testId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    
    // Optimistic update
    setTests((prev) =>
      prev.map((t) => (t.id === testId ? { ...t, isPublished: newStatus } : t))
    );

    try {
      const response = await fetch(`/api/admin/tests/${testId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update publish status');

      toast({
        title: 'Success',
        description: `Test ${newStatus ? 'published' : 'unpublished'} successfully`,
      });
    } catch (error: any) {
      // Revert on error
      setTests((prev) =>
        prev.map((t) => (t.id === testId ? { ...t, isPublished: currentStatus } : t))
      );
      
      toast({
        title: 'Error',
        description: error.message || 'Failed to update publish status',
        variant: 'destructive',
      });
    }
  };

  const handleViewQuestions = async (test: Test) => {
    setViewingTest(test);
    setViewQuestionsDialogOpen(true);
    setLoadingQuestions(true);
    
    try {
      const response = await fetch(`/api/admin/tests/${test.id}/questions`);
      if (!response.ok) throw new Error('Failed to fetch questions');
      
      const data = await response.json();
      setTestQuestions(data.questions || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load questions',
        variant: 'destructive',
      });
      setTestQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const getTestTypeBadge = (type: string) => {
    const variants = {
      mock: { variant: 'default' as const, label: 'Mock Test' },
      live: { variant: 'destructive' as const, label: 'Live Test' },
      sectional: { variant: 'secondary' as const, label: 'Sectional' },
      practice: { variant: 'outline' as const, label: 'Practice' },
    };

    const { variant, label } = variants[type as keyof typeof variants] || variants.mock;
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tests</h1>
          <p className="text-muted-foreground mt-1">
            Manage all tests and their configurations
          </p>
        </div>
        <Button onClick={() => router.push('/admin/tests/builder')}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Test
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Test Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="mock">Mock Test</SelectItem>
            <SelectItem value="live">Live Test</SelectItem>
            <SelectItem value="sectional">Sectional</SelectItem>
            <SelectItem value="practice">Practice</SelectItem>
          </SelectContent>
        </Select>

        <Select value={publishedFilter} onValueChange={setPublishedFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="true">Published</SelectItem>
            <SelectItem value="false">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      ) : tests.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No tests found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push('/admin/tests/builder')}
          >
            Create Your First Test
          </Button>
        </Card>
      ) : (
        <>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell className="font-medium">
                      <div>
                        <p>{test.title}</p>
                        {test.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {test.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getTestTypeBadge(test.testType)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{test.questionCount}</span>
                        {test.questionCount !== test.totalQuestions && (
                          <span className="text-xs text-amber-600">
                            (Target: {test.totalQuestions})
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {test.duration} min
                      </div>
                    </TableCell>
                    <TableCell>{test.totalMarks}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={test.isPublished}
                            onCheckedChange={() =>
                              handleTogglePublish(test.id, test.isPublished)
                            }
                          />
                          <Badge
                            variant={test.isPublished ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {test.isPublished ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                        {test.isFree && (
                          <Badge variant="outline" className="text-xs">
                            Free
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(test.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewQuestions(test)}
                          title="View Questions"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            router.push(`/admin/tests/builder?id=${test.id}`)
                          }
                          title="Edit Test"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setTestToDelete(test.id);
                            setDeleteDialogOpen(true);
                          }}
                          title="Delete Test"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Test</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this test? This action cannot be undone.
              All associated test questions will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTestToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet open={viewQuestionsDialogOpen} onOpenChange={setViewQuestionsDialogOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Test Questions</SheetTitle>
            <SheetDescription>
              {viewingTest && `${viewingTest.title} - ${testQuestions.length} Questions`}
            </SheetDescription>
          </SheetHeader>
          
          <ScrollArea className="h-[calc(100vh-8rem)] mt-6">
            {loadingQuestions ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : testQuestions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No questions found for this test
              </div>
            ) : (
              <div className="space-y-4 pr-4">
                {testQuestions.map((q: any, index: number) => (
                  <Card key={q.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">Q{index + 1}</Badge>
                            {q.sectionName && (
                              <Badge variant="secondary">{q.sectionName}</Badge>
                            )}
                          </div>
                          <p className="font-medium text-sm">{q.questionText}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge className="text-xs">{q.marks || 1} mark{(q.marks || 1) > 1 ? 's' : ''}</Badge>
                          {q.difficultyLevel && (
                            <Badge 
                              variant={
                                q.difficultyLevel === 'easy' 
                                  ? 'default' 
                                  : q.difficultyLevel === 'medium' 
                                  ? 'secondary' 
                                  : 'destructive'
                              }
                              className="text-xs"
                            >
                              {q.difficultyLevel}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        {[
                          { num: 1, text: q.option1 },
                          { num: 2, text: q.option2 },
                          { num: 3, text: q.option3 },
                          { num: 4, text: q.option4 },
                        ].map((opt) => (
                          opt.text && (
                            <div 
                              key={opt.num}
                              className={`text-sm p-2 rounded ${
                                q.correctOption === opt.num
                                  ? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 font-medium'
                                  : 'bg-muted/50'
                              }`}
                            >
                              <span className="font-semibold mr-2">{opt.num}.</span>
                              {opt.text}
                              {q.correctOption === opt.num && (
                                <CheckCircle className="inline ml-2 h-3 w-3 text-green-600" />
                              )}
                            </div>
                          )
                        ))}
                      </div>
                      
                      {q.explanation && (
                        <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                          <span className="font-semibold">Explanation:</span> {q.explanation}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
