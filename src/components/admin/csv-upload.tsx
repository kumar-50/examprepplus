'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { parseCSV, ParsedQuestion, ValidationError, downloadTemplate } from '@/lib/csv-parser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, Download, AlertCircle, CheckCircle2, FileText, AlertTriangle, Copy, Save } from 'lucide-react';

interface DuplicateQuestion extends ParsedQuestion {
  existingQuestionId: string;
}

interface ErrorWithData extends ValidationError {
  data?: {
    question_text?: string;
    option_a?: string;
    option_b?: string;
    option_c?: string;
    option_d?: string;
    correct_index?: string;
    section_name?: string;
    year?: string;
  };
}

export function CSVUploadComponent() {
  const router = useRouter();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [errors, setErrors] = useState<ErrorWithData[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateQuestion[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [showValidationSheet, setShowValidationSheet] = useState(false);
  const [editingErrors, setEditingErrors] = useState<Map<number, any>>(new Map());
  const [importResult, setImportResult] = useState<{
    success: boolean;
    imported: number;
    skipped: number;
    message: string;
  } | null>(null);

  // Auto-open validation sheet when errors or duplicates are found
  useEffect(() => {
    if (errors.length > 0 || duplicates.length > 0) {
      setShowValidationSheet(true);
      
      if (errors.length > 0) {
        toast({
          title: `Found ${errors.length} validation error${errors.length > 1 ? 's' : ''}`,
          description: 'Please fix the errors to continue with the import',
          variant: 'destructive',
        });
      }
    }
  }, [errors.length, duplicates.length]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      processFile(droppedFile);
    } else {
      alert('Please upload a CSV file');
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  }, []);

  const processFile = async (file: File) => {
    setFile(file);
    setIsProcessing(true);
    setImportResult(null);
    setDuplicates([]);

    try {
      const result = await parseCSV(file);
      setParsedQuestions(result.questions);
      setErrors(result.errors);
      setTotalRows(result.totalRows);

      // Check for duplicates if validation passed
      if (result.questions.length > 0) {
        await checkDuplicates(result.questions);
      }
    } catch (error) {
      console.error('Error parsing CSV:', error);
      setErrors([{
        row: 0,
        field: 'file',
        reason: error instanceof Error ? error.message : 'Failed to parse CSV file',
      }]);
      setParsedQuestions([]);
      setTotalRows(0);
      setShowValidationSheet(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const checkDuplicates = async (questions: ParsedQuestion[]) => {
    try {
      const response = await fetch('/api/admin/questions/check-duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions: questions.map(q => ({
            questionText: q.questionText,
            sectionName: q.sectionName,
            rowNumber: q.rowNumber,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const dupes = data.duplicates.map((dup: any) => {
          const originalQuestion = questions.find(q => q.rowNumber === dup.rowNumber);
          return {
            ...originalQuestion!,
            existingQuestionId: dup.existingQuestionId,
          };
        });
        setDuplicates(dupes);
      }
    } catch (error) {
      console.error('Error checking duplicates:', error);
    }
  };

  const handleImport = async () => {
    if (parsedQuestions.length === 0) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const response = await fetch('/api/admin/questions/import-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questions: parsedQuestions.map((q) => ({
            questionText: q.questionText,
            option1: q.option1,
            option2: q.option2,
            option3: q.option3,
            option4: q.option4,
            correctOption: q.correctOption,
            sectionName: q.sectionName,
            year: q.year,
          })),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setImportResult({
          success: true,
          imported: data.imported,
          skipped: data.skipped || 0,
          message: data.message,
        });
        // Clear the form after successful import
        setTimeout(() => {
          setFile(null);
          setParsedQuestions([]);
          setErrors([]);
          setDuplicates([]);
          setTotalRows(0);
          router.refresh();
        }, 3000);
      } else {
        setImportResult({
          success: false,
          imported: 0,
          skipped: 0,
          message: data.error || 'Failed to import questions',
        });
      }
    } catch (error) {
      console.error('Error importing questions:', error);
      setImportResult({
        success: false,
        imported: 0,
        skipped: 0,
        message: 'Network error occurred while importing',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedQuestions([]);
    setErrors([]);
    setDuplicates([]);
    setTotalRows(0);
    setImportResult(null);
    setShowValidationSheet(false);
    setEditingErrors(new Map());
  };

  const handleFixError = (errorIndex: number, field: string, value: string) => {
    const newEditing = new Map(editingErrors);
    const errorRow = errors[errorIndex];
    const currentEdit = newEditing.get(errorIndex) || { ...errorRow.data };
    currentEdit[field] = value;
    newEditing.set(errorIndex, currentEdit);
    setEditingErrors(newEditing);
  };

  const handleSaveErrorFix = (errorIndex: number) => {
    const errorRow = errors[errorIndex];
    const fixedData = editingErrors.get(errorIndex);
    
    if (!fixedData) return;

    // Validate the fixed data
    const validationErrors: string[] = [];
    
    if (!fixedData.question_text?.trim()) validationErrors.push('Question text required');
    if (!fixedData.option_a?.trim()) validationErrors.push('Option A required');
    if (!fixedData.option_b?.trim()) validationErrors.push('Option B required');
    if (!fixedData.option_c?.trim()) validationErrors.push('Option C required');
    if (!fixedData.option_d?.trim()) validationErrors.push('Option D required');
    if (!fixedData.section_name?.trim()) validationErrors.push('Section required');
    
    const correctIndex = parseInt(fixedData.correct_index);
    if (isNaN(correctIndex) || correctIndex < 0 || correctIndex > 3) {
      validationErrors.push('Correct index must be 0, 1, 2, or 3');
    }

    if (validationErrors.length > 0) {
      alert('Please fix all validation errors: ' + validationErrors.join(', '));
      return;
    }

    // Convert to ParsedQuestion
    const newQuestion: ParsedQuestion = {
      questionText: fixedData.question_text.trim(),
      option1: fixedData.option_a.trim(),
      option2: fixedData.option_b.trim(),
      option3: fixedData.option_c.trim(),
      option4: fixedData.option_d.trim(),
      correctOption: correctIndex + 1,
      sectionName: fixedData.section_name.trim(),
      year: fixedData.year?.trim() || '',
      rowNumber: errorRow.row,
    };

    // Add to parsed questions
    setParsedQuestions([...parsedQuestions, newQuestion]);
    
    // Remove from errors
    const newErrors = errors.filter((_, idx) => idx !== errorIndex);
    setErrors(newErrors);
    
    // Remove from editing
    const newEditing = new Map(editingErrors);
    newEditing.delete(errorIndex);
    setEditingErrors(newEditing);
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload CSV File</CardTitle>
          <CardDescription>
            Upload a CSV file containing questions to import into the system.
            <Button
              variant="link"
              onClick={downloadTemplate}
              className="ml-2 p-0 h-auto"
            >
              <Download className="mr-1 h-4 w-4" />
              Download Template
            </Button>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            {file ? (
              <div className="space-y-4">
                <FileText className="mx-auto h-12 w-12 text-primary" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <Button variant="outline" onClick={handleReset}>
                  Choose Different File
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <div>
                  <p className="text-lg font-medium">Drop CSV file here</p>
                  <p className="text-sm text-muted-foreground">or click to browse</p>
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileInput}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload">
                  <Button variant="outline" asChild>
                    <span>Browse Files</span>
                  </Button>
                </label>
              </div>
            )}
          </div>

          {isProcessing && (
            <Alert className="mt-4">
              <AlertDescription>Processing CSV file...</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Validation Results Summary */}
      {!isProcessing && (errors.length > 0 || duplicates.length > 0 || parsedQuestions.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Validation Results</CardTitle>
            <CardDescription>
              Total rows: {totalRows} | Valid: {parsedQuestions.length} | Errors: {errors.length} | Duplicates: {duplicates.length}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Found {errors.length} validation error(s).</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowValidationSheet(true)}
                  >
                    View & Fix Errors
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {duplicates.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Found {duplicates.length} duplicate question(s) that will be skipped.</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowValidationSheet(true)}
                  >
                    View Duplicates
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {parsedQuestions.length > 0 && errors.length === 0 && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  {parsedQuestions.length - duplicates.length} questions ready to import.
                  {duplicates.length > 0 && ` ${duplicates.length} duplicates will be skipped.`}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Preview Table */}
      {parsedQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview ({parsedQuestions.length} questions)</CardTitle>
            <CardDescription>
              Showing first 10 questions that will be imported
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Row</TableHead>
                    <TableHead className="min-w-[300px]">Question</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Correct</TableHead>
                    <TableHead>Year</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedQuestions.slice(0, 10).map((q) => (
                    <TableRow key={q.rowNumber}>
                      <TableCell>{q.rowNumber}</TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {q.questionText}
                      </TableCell>
                      <TableCell>{q.sectionName}</TableCell>
                      <TableCell>Option {q.correctOption}</TableCell>
                      <TableCell>{q.year || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {parsedQuestions.length > 10 && (
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  ... and {parsedQuestions.length - 10} more questions
                </p>
              )}
            </div>

            {errors.length > 0 && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Cannot import: {errors.length} validation error{errors.length > 1 ? 's' : ''} found</p>
                    <p className="text-sm mt-1">Fix the errors in the validation panel to enable import</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowValidationSheet(true)}
                  >
                    View & Fix Errors
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <div className="mt-6 flex gap-4">
              <Button
                onClick={handleImport}
                disabled={errors.length > 0 || parsedQuestions.length === 0 || isImporting}
                size="lg"
              >
                {isImporting 
                  ? 'Importing...' 
                  : `Import ${parsedQuestions.length - duplicates.length} Question${parsedQuestions.length - duplicates.length !== 1 ? 's' : ''}`}
              </Button>
              <Button variant="outline" onClick={handleReset} disabled={isImporting}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Result */}
      {importResult && (
        <Alert variant={importResult.success ? 'default' : 'destructive'}>
          {importResult.success ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>
            {importResult.message}
            {importResult.success && ' Redirecting...'}
          </AlertDescription>
        </Alert>
      )}

      {/* Validation Sheet */}
      <Sheet open={showValidationSheet} onOpenChange={setShowValidationSheet}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Validation Details</SheetTitle>
            <SheetDescription>
              Review validation errors and duplicate questions
            </SheetDescription>
          </SheetHeader>

          <Tabs defaultValue={errors.length > 0 ? "errors" : "duplicates"} className="mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="errors" className="relative">
                Errors
                {errors.length > 0 && (
                  <Badge variant="destructive" className="ml-2">{errors.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="duplicates" className="relative">
                Duplicates
                {duplicates.length > 0 && (
                  <Badge variant="secondary" className="ml-2">{duplicates.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="valid">
                Valid
                <Badge variant="default" className="ml-2">{parsedQuestions.length - duplicates.length}</Badge>
              </TabsTrigger>
            </TabsList>

            {/* Errors Tab */}
            <TabsContent value="errors" className="space-y-4">
              {errors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>No validation errors found!</p>
                </div>
              ) : (
                <>
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Fix these errors below and click Save, or fix them in your CSV file and re-upload.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-3">
                    {errors.map((error, idx) => {
                      const isEditing = editingErrors.has(idx);
                      const editData = editingErrors.get(idx) || error.data || {};
                      
                      return (
                        <Card key={idx}>
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <Badge variant="destructive">Row {error.row}</Badge>
                                <p className="text-sm text-red-600 mt-2">{error.reason}</p>
                              </div>
                              {error.data && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (!isEditing) {
                                      const newEditing = new Map(editingErrors);
                                      newEditing.set(idx, { ...error.data });
                                      setEditingErrors(newEditing);
                                    }
                                  }}
                                >
                                  {isEditing ? 'Editing...' : 'Fix Now'}
                                </Button>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            {isEditing && error.data ? (
                              <div className="space-y-4">
                                <div className="grid gap-4">
                                  <div>
                                    <Label htmlFor={`question-${idx}`}>Question Text *</Label>
                                    <Input
                                      id={`question-${idx}`}
                                      value={editData.question_text || ''}
                                      onChange={(e) => handleFixError(idx, 'question_text', e.target.value)}
                                      className={!editData.question_text?.trim() ? 'border-red-500' : ''}
                                    />
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor={`option-a-${idx}`}>Option A *</Label>
                                      <Input
                                        id={`option-a-${idx}`}
                                        value={editData.option_a || ''}
                                        onChange={(e) => handleFixError(idx, 'option_a', e.target.value)}
                                        className={!editData.option_a?.trim() ? 'border-red-500' : ''}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor={`option-b-${idx}`}>Option B *</Label>
                                      <Input
                                        id={`option-b-${idx}`}
                                        value={editData.option_b || ''}
                                        onChange={(e) => handleFixError(idx, 'option_b', e.target.value)}
                                        className={!editData.option_b?.trim() ? 'border-red-500' : ''}
                                      />
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor={`option-c-${idx}`}>Option C *</Label>
                                      <Input
                                        id={`option-c-${idx}`}
                                        value={editData.option_c || ''}
                                        onChange={(e) => handleFixError(idx, 'option_c', e.target.value)}
                                        className={!editData.option_c?.trim() ? 'border-red-500' : ''}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor={`option-d-${idx}`}>Option D *</Label>
                                      <Input
                                        id={`option-d-${idx}`}
                                        value={editData.option_d || ''}
                                        onChange={(e) => handleFixError(idx, 'option_d', e.target.value)}
                                        className={!editData.option_d?.trim() ? 'border-red-500' : ''}
                                      />
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-3 gap-4">
                                    <div>
                                      <Label htmlFor={`correct-${idx}`}>Correct Answer *</Label>
                                      <Select
                                        value={editData.correct_index || ''}
                                        onValueChange={(value) => handleFixError(idx, 'correct_index', value)}
                                      >
                                        <SelectTrigger className={!editData.correct_index || parseInt(editData.correct_index) > 3 ? 'border-red-500' : ''}>
                                          <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="0">Option A (0)</SelectItem>
                                          <SelectItem value="1">Option B (1)</SelectItem>
                                          <SelectItem value="2">Option C (2)</SelectItem>
                                          <SelectItem value="3">Option D (3)</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label htmlFor={`section-${idx}`}>Section *</Label>
                                      <Input
                                        id={`section-${idx}`}
                                        value={editData.section_name || ''}
                                        onChange={(e) => handleFixError(idx, 'section_name', e.target.value)}
                                        className={!editData.section_name?.trim() ? 'border-red-500' : ''}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor={`year-${idx}`}>Year</Label>
                                      <Input
                                        id={`year-${idx}`}
                                        value={editData.year || ''}
                                        onChange={(e) => handleFixError(idx, 'year', e.target.value)}
                                        placeholder="2024"
                                      />
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex gap-2 pt-2">
                                  <Button
                                    onClick={() => handleSaveErrorFix(idx)}
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <Save className="mr-2 h-4 w-4" />
                                    Save & Add to Import
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const newEditing = new Map(editingErrors);
                                      newEditing.delete(idx);
                                      setEditingErrors(newEditing);
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground space-y-1">
                                <p><strong>Field:</strong> {error.field}</p>
                                {error.data && (
                                  <>
                                    <p className="truncate"><strong>Current value:</strong> {(error.data as any)[error.field] || '(empty)'}</p>
                                    <p className="text-xs italic mt-2">Click "Fix Now" to edit this row directly</p>
                                  </>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </>
              )}
            </TabsContent>

            {/* Duplicates Tab */}
            <TabsContent value="duplicates" className="space-y-4">
              {duplicates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>No duplicate questions found!</p>
                </div>
              ) : (
                <>
                  <Alert>
                    <Copy className="h-4 w-4" />
                    <AlertDescription>
                      These questions already exist in the database and will be skipped during import.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-3">
                    {duplicates.map((dup, idx) => (
                      <Card key={idx}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge>Row {dup.rowNumber}</Badge>
                                <Badge variant="outline">{dup.sectionName}</Badge>
                              </div>
                              <p className="text-sm font-medium">{dup.questionText}</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-muted-foreground">
                            Matches existing question ID: {dup.existingQuestionId.substring(0, 8)}...
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>

            {/* Valid Questions Tab */}
            <TabsContent value="valid" className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  These questions will be imported successfully.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                {parsedQuestions
                  .filter(q => !duplicates.some(d => d.rowNumber === q.rowNumber))
                  .slice(0, 20)
                  .map((q, idx) => (
                    <Card key={idx}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">Row {q.rowNumber}</Badge>
                              <Badge variant="secondary">{q.sectionName}</Badge>
                              <Badge variant="outline">Option {q.correctOption}</Badge>
                            </div>
                            <p className="text-sm">{q.questionText}</p>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                {parsedQuestions.filter(q => !duplicates.some(d => d.rowNumber === q.rowNumber)).length > 20 && (
                  <p className="text-sm text-center text-muted-foreground">
                    ... and {parsedQuestions.filter(q => !duplicates.some(d => d.rowNumber === q.rowNumber)).length - 20} more questions
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </div>
  );
}
