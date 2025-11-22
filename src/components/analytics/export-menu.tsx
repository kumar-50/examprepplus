/**
 * Export Menu Component
 * 
 * Dropdown menu for exporting analytics data
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import {
  exportToPDF,
  exportCompleteAnalytics,
  exportOverviewToCSV,
  exportAccuracyTrendToCSV,
  exportSectionPerformanceToCSV,
  exportTestTypeComparisonToCSV,
  exportDifficultyBreakdownToCSV,
} from '@/lib/analytics/export';
import type {
  OverviewStats,
  AccuracyDataPoint,
  SectionPerformance,
  TestTypeComparison,
  DifficultyBreakdown,
} from '@/lib/analytics/types';

interface ExportMenuProps {
  data: {
    overview: OverviewStats;
    accuracyTrend: AccuracyDataPoint[];
    sectionPerformance: SectionPerformance[];
    testTypeComparison: TestTypeComparison[];
    difficultyBreakdown: DifficultyBreakdown[];
  };
}

export function ExportMenu({ data }: ExportMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" data-export-button>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Export Analytics</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="w-4 h-4 mr-2" />
          Export to PDF
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => exportCompleteAnalytics(data)}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Complete Report (CSV)
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Individual Exports
        </DropdownMenuLabel>
        
        <DropdownMenuItem onClick={() => exportOverviewToCSV(data.overview)}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Overview Stats
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => exportAccuracyTrendToCSV(data.accuracyTrend)}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Accuracy Trend
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => exportSectionPerformanceToCSV(data.sectionPerformance)}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Section Performance
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => exportTestTypeComparisonToCSV(data.testTypeComparison)}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Test Type Comparison
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => exportDifficultyBreakdownToCSV(data.difficultyBreakdown)}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Difficulty Breakdown
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
