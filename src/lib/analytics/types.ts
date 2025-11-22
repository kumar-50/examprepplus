/**
 * Analytics Dashboard - Type Definitions
 * 
 * Comprehensive type definitions for all analytics features
 */

// ============================================================================
// Overview Statistics
// ============================================================================

export interface OverviewStats {
  totalTests: number;
  totalQuestions: number;
  overallAccuracy: number; // 0-100 percentage
  totalTimeSpent: number; // in minutes
  currentStreak: number; // days
  testsThisWeek: number;
}

// ============================================================================
// Accuracy Trend
// ============================================================================

export interface AccuracyDataPoint {
  date: string; // ISO date string
  accuracy: number; // 0-100 percentage
  testName: string;
  testType: string;
  totalQuestions: number;
  testId: string;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
  preset: '7d' | '30d' | '90d' | 'all' | 'custom';
}

// ============================================================================
// Section Performance
// ============================================================================

export interface SectionPerformance {
  sectionId: string;
  sectionName: string;
  accuracy: number; // 0-100 percentage
  questionsAttempted: number;
  correctAnswers: number;
  incorrectAnswers: number;
  avgTimePerQuestion: number; // in seconds
}

export type SectionSortBy = 'accuracy' | 'attempts' | 'name';
export type SortDirection = 'asc' | 'desc';

// ============================================================================
// Test Type Comparison
// ============================================================================

export interface TestTypeComparison {
  testType: string;
  avgAccuracy: number; // 0-100 percentage
  testCount: number;
  totalQuestions: number;
  passRate: number; // percentage of tests passed (accuracy >= 60%)
}

// ============================================================================
// Activity & Engagement
// ============================================================================

export interface ActivityData {
  date: string; // YYYY-MM-DD
  testCount: number;
  questionsCount: number;
  avgAccuracy: number;
}

export interface CalendarDay {
  date: Date;
  testCount: number;
  questionsAnswered: number;
  accuracy: number;
  intensity: 'none' | 'low' | 'medium' | 'high';
}

// ============================================================================
// Difficulty Analysis
// ============================================================================

export interface DifficultyBreakdown {
  difficulty: 'easy' | 'medium' | 'hard';
  attempted: number;
  correct: number;
  accuracy: number; // 0-100 percentage
}

// ============================================================================
// Time Analysis
// ============================================================================

export interface HourPerformance {
  hour: number; // 0-23
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  avgAccuracy: number;
  testCount: number;
}

export interface DayOfWeekPerformance {
  dayOfWeek: number; // 0-6
  dayName: string;
  avgAccuracy: number;
  testCount: number;
}

export interface BestPerformanceTime {
  hour: number;
  dayOfWeek: number;
  accuracy: number;
  description: string; // e.g., "Tuesday mornings at 10 AM"
}

// ============================================================================
// Learning Insights
// ============================================================================

export type InsightType = 'success' | 'warning' | 'info' | 'recommendation';

export interface Insight {
  id: string;
  type: InsightType;
  icon: string; // emoji or icon name
  title: string;
  message: string;
  priority: number; // 1-5, higher = more important
  action?: {
    label: string;
    url: string;
  };
  dismissible: boolean;
  createdAt: Date;
}

// ============================================================================
// Charts & Visualization
// ============================================================================

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, any>;
}

export interface TimeSeriesData {
  timestamp: string | Date;
  value: number;
  label?: string;
}

// ============================================================================
// Filters & Options
// ============================================================================

export interface AnalyticsFilters {
  dateRange: DateRange;
  testTypes?: string[];
  sections?: string[];
  difficulties?: ('easy' | 'medium' | 'hard')[];
}

// ============================================================================
// API Response Types
// ============================================================================

export interface AnalyticsResponse<T> {
  data: T;
  meta?: {
    total: number;
    page?: number;
    pageSize?: number;
  };
  error?: string;
}

// ============================================================================
// Aggregated Analytics Data
// ============================================================================

export interface AnalyticsDashboardData {
  overview: OverviewStats;
  accuracyTrend: AccuracyDataPoint[];
  sectionPerformance: SectionPerformance[];
  testTypeComparison: TestTypeComparison[];
  lastUpdated: Date;
}
