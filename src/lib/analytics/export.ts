/**
 * Analytics Export Utilities
 * 
 * Export analytics data to CSV and PDF formats
 */

import type {
  OverviewStats,
  AccuracyDataPoint,
  SectionPerformance,
  TestTypeComparison,
  DifficultyBreakdown,
} from './types';

// ============================================================================
// CSV Export
// ============================================================================

export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values with commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

export function exportOverviewToCSV(stats: OverviewStats) {
  const data = [
    { metric: 'Total Tests', value: stats.totalTests },
    { metric: 'Total Questions', value: stats.totalQuestions },
    { metric: 'Overall Accuracy (%)', value: stats.overallAccuracy },
    { metric: 'Total Time Spent (minutes)', value: stats.totalTimeSpent },
    { metric: 'Current Streak (days)', value: stats.currentStreak },
    { metric: 'Tests This Week', value: stats.testsThisWeek },
  ];
  
  exportToCSV(data, `analytics-overview-${new Date().toISOString().split('T')[0]}`);
}

export function exportAccuracyTrendToCSV(data: AccuracyDataPoint[]) {
  const csvData = data.map(point => ({
    date: point.date,
    test_name: point.testName,
    test_type: point.testType,
    accuracy_percent: point.accuracy,
    total_questions: point.totalQuestions,
  }));
  
  exportToCSV(csvData, `accuracy-trend-${new Date().toISOString().split('T')[0]}`);
}

export function exportSectionPerformanceToCSV(data: SectionPerformance[]) {
  const csvData = data.map(section => ({
    section: section.sectionName,
    accuracy_percent: section.accuracy,
    questions_attempted: section.questionsAttempted,
    correct_answers: section.correctAnswers,
    incorrect_answers: section.incorrectAnswers,
    avg_time_per_question_seconds: section.avgTimePerQuestion,
  }));
  
  exportToCSV(csvData, `section-performance-${new Date().toISOString().split('T')[0]}`);
}

export function exportTestTypeComparisonToCSV(data: TestTypeComparison[]) {
  const csvData = data.map(type => ({
    test_type: type.testType,
    avg_accuracy_percent: type.avgAccuracy,
    test_count: type.testCount,
    total_questions: type.totalQuestions,
    pass_rate_percent: type.passRate,
  }));
  
  exportToCSV(csvData, `test-type-comparison-${new Date().toISOString().split('T')[0]}`);
}

export function exportDifficultyBreakdownToCSV(data: DifficultyBreakdown[]) {
  const csvData = data.map(diff => ({
    difficulty: diff.difficulty,
    attempted: diff.attempted,
    correct: diff.correct,
    accuracy_percent: diff.accuracy,
  }));
  
  exportToCSV(csvData, `difficulty-breakdown-${new Date().toISOString().split('T')[0]}`);
}

// ============================================================================
// PDF Export (using browser print)
// ============================================================================

export function exportToPDF() {
  // Hide export buttons before printing
  const exportButtons = document.querySelectorAll('[data-export-button]');
  exportButtons.forEach(btn => {
    (btn as HTMLElement).style.display = 'none';
  });

  // Trigger print dialog
  window.print();

  // Restore export buttons after print dialog closes
  setTimeout(() => {
    exportButtons.forEach(btn => {
      (btn as HTMLElement).style.display = '';
    });
  }, 1000);
}

// ============================================================================
// Helper Functions
// ============================================================================

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================================
// Complete Analytics Export
// ============================================================================

export function exportCompleteAnalytics(data: {
  overview: OverviewStats;
  accuracyTrend: AccuracyDataPoint[];
  sectionPerformance: SectionPerformance[];
  testTypeComparison: TestTypeComparison[];
  difficultyBreakdown: DifficultyBreakdown[];
}) {
  const timestamp = new Date().toISOString().split('T')[0];
  
  // Combine all data into one comprehensive CSV
  const allData = [
    '=== OVERVIEW STATISTICS ===',
    'Metric,Value',
    `Total Tests,${data.overview.totalTests}`,
    `Total Questions,${data.overview.totalQuestions}`,
    `Overall Accuracy (%),${data.overview.overallAccuracy}`,
    `Total Time Spent (minutes),${data.overview.totalTimeSpent}`,
    `Current Streak (days),${data.overview.currentStreak}`,
    `Tests This Week,${data.overview.testsThisWeek}`,
    '',
    '=== SECTION PERFORMANCE ===',
    'Section,Accuracy (%),Attempted,Correct,Incorrect,Avg Time (s)',
    ...data.sectionPerformance.map(s => 
      `${s.sectionName},${s.accuracy},${s.questionsAttempted},${s.correctAnswers},${s.incorrectAnswers},${s.avgTimePerQuestion}`
    ),
    '',
    '=== TEST TYPE COMPARISON ===',
    'Test Type,Avg Accuracy (%),Test Count,Total Questions,Pass Rate (%)',
    ...data.testTypeComparison.map(t => 
      `${t.testType},${t.avgAccuracy},${t.testCount},${t.totalQuestions},${t.passRate}`
    ),
    '',
    '=== DIFFICULTY BREAKDOWN ===',
    'Difficulty,Attempted,Correct,Accuracy (%)',
    ...data.difficultyBreakdown.map(d => 
      `${d.difficulty},${d.attempted},${d.correct},${d.accuracy}`
    ),
    '',
    '=== ACCURACY TREND ===',
    'Date,Test Name,Test Type,Accuracy (%),Questions',
    ...data.accuracyTrend.map(a => 
      `${a.date},${a.testName},${a.testType},${a.accuracy},${a.totalQuestions}`
    ),
  ].join('\n');

  const blob = new Blob([allData], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `analytics-complete-${timestamp}.csv`);
}
