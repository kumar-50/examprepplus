'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
import { Upload, Download, AlertCircle, CheckCircle2, FileText } from 'lucide-react';

export function CSVUploadComponent() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    imported: number;
    message: string;
  } | null>(null);

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

    try {
      const result = await parseCSV(file);
      setParsedQuestions(result.questions);
      setErrors(result.errors);
      setTotalRows(result.totalRows);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      setErrors([{
        row: 0,
        field: 'file',
        reason: error instanceof Error ? error.message : 'Failed to parse CSV file',
      }]);
      setParsedQuestions([]);
      setTotalRows(0);
    } finally {
      setIsProcessing(false);
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
          message: data.message,
        });
        // Clear the form after successful import
        setTimeout(() => {
          setFile(null);
          setParsedQuestions([]);
          setErrors([]);
          setTotalRows(0);
          router.refresh();
        }, 3000);
      } else {
        setImportResult({
          success: false,
          imported: 0,
          message: data.error || 'Failed to import questions',
        });
      }
    } catch (error) {
      console.error('Error importing questions:', error);
      setImportResult({
        success: false,
        imported: 0,
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
    setTotalRows(0);
    setImportResult(null);
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

      {/* Validation Results */}
      {!isProcessing && (errors.length > 0 || parsedQuestions.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Validation Results</CardTitle>
            <CardDescription>
              Total rows: {totalRows} | Valid: {parsedQuestions.length} | Errors:{' '}
              {errors.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errors.length > 0 && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-2">
                    Found {errors.length} validation error(s). Please fix them before importing.
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {errors.slice(0, 10).map((error, idx) => (
                      <div key={idx} className="text-sm">
                        Row {error.row}: {error.field} - {error.reason}
                      </div>
                    ))}
                    {errors.length > 10 && (
                      <div className="text-sm italic">
                        ... and {errors.length - 10} more errors
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {parsedQuestions.length > 0 && errors.length === 0 && (
              <Alert className="mb-4">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  All {parsedQuestions.length} questions passed validation and are ready to import.
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

            <div className="mt-6 flex gap-4">
              <Button
                onClick={handleImport}
                disabled={errors.length > 0 || isImporting}
                size="lg"
              >
                {isImporting ? 'Importing...' : `Import ${parsedQuestions.length} Questions`}
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
    </div>
  );
}
