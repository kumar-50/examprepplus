import { Metadata } from 'next';
import { CSVUploadComponent } from '@/components/admin/csv-upload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Import Questions | Admin',
  description: 'Bulk import questions from CSV',
};

export default function ImportQuestionsPage() {
  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/questions">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Questions
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Import Questions</h1>
        <p className="text-muted-foreground mt-2">
          Bulk import questions from a CSV file. The file should contain columns: question_text,
          option_a, option_b, option_c, option_d, correct_index (0-3), section_name, and year.
        </p>
      </div>

      <CSVUploadComponent />

      {/* Instructions Card */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Import Instructions</CardTitle>
          <CardDescription>How to prepare your CSV file for import</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Required Columns:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>
                <code className="bg-muted px-1 py-0.5 rounded">question_text</code> - The question
                text (required)
              </li>
              <li>
                <code className="bg-muted px-1 py-0.5 rounded">option_a</code> - First option
                (required)
              </li>
              <li>
                <code className="bg-muted px-1 py-0.5 rounded">option_b</code> - Second option
                (required)
              </li>
              <li>
                <code className="bg-muted px-1 py-0.5 rounded">option_c</code> - Third option
                (required)
              </li>
              <li>
                <code className="bg-muted px-1 py-0.5 rounded">option_d</code> - Fourth option
                (required)
              </li>
              <li>
                <code className="bg-muted px-1 py-0.5 rounded">correct_index</code> - Index of
                correct option: 0 for A, 1 for B, 2 for C, 3 for D (required)
              </li>
              <li>
                <code className="bg-muted px-1 py-0.5 rounded">section_name</code> - Name of the
                section (required, will auto-create if doesn't exist)
              </li>
              <li>
                <code className="bg-muted px-1 py-0.5 rounded">year</code> - Year of question
                (optional)
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Important Notes:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>All rows must pass validation before import can proceed</li>
              <li>Sections will be automatically created if they don't exist</li>
              <li>The import is performed as a single transaction (all or nothing)</li>
              <li>Maximum recommended file size: 500 rows for optimal performance</li>
              <li>Use the template download button above to get a properly formatted CSV</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
