'use client';

import { useState } from 'react';
import { Search, Filter, Grid, List, Lock, Clock, FileText, Globe, Star } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Test {
  id: string;
  title: string;
  description: string | null;
  testType: 'mock' | 'live' | 'sectional' | 'practice';
  totalQuestions: number;
  totalMarks: number;
  duration: number;
  isFree: boolean;
  averageRating: number | null;
  totalRatings: number | null;
  userAttemptCount: number;
}

interface TestLibraryClientProps {
  tests: Test[];
}

export function TestLibraryClient({ tests }: TestLibraryClientProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [examTypeFilter, setExamTypeFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [durationFilter, setDurationFilter] = useState<string>('all');

  // Filter tests based on search and filters
  const filteredTests = tests.filter((test) => {
    const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Add more filters as needed
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search for tests by title or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-4">
          <Select value={examTypeFilter} onValueChange={setExamTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Exam Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="mock">Mock Test</SelectItem>
              <SelectItem value="sectional">Sectional</SelectItem>
              <SelectItem value="practice">Practice</SelectItem>
            </SelectContent>
          </Select>

          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>

          <Select value={durationFilter} onValueChange={setDurationFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Durations</SelectItem>
              <SelectItem value="30">Under 30 min</SelectItem>
              <SelectItem value="60">30-60 min</SelectItem>
              <SelectItem value="120">60-120 min</SelectItem>
            </SelectContent>
          </Select>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredTests.length} test{filteredTests.length !== 1 ? 's' : ''}
      </div>

      {/* Test Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test) => (
            <TestCard key={test.id} test={test} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTests.map((test) => (
            <TestListItem key={test.id} test={test} />
          ))}
        </div>
      )}

      {filteredTests.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No tests found matching your criteria</p>
        </div>
      )}
    </div>
  );
}

function TestCard({ test }: { test: Test }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow overflow-hidden">
      {/* Header Badges */}
      <div className="p-4 flex items-start justify-between gap-2 flex-wrap">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {test.duration} min
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <FileText className="w-3 h-3 mr-1" />
            {test.totalQuestions} Qs
          </Badge>
          <Badge variant="outline" className="text-xs capitalize">
            {test.testType}
          </Badge>
        </div>
        {!test.isFree && (
          <Lock className="w-4 h-4 text-yellow-500" />
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-4 space-y-3">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-2">
          {test.title}
        </h3>

        {test.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {test.description}
          </p>
        )}

        {/* Rating and Attempts */}
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          {test.averageRating && test.totalRatings ? (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{test.averageRating.toFixed(1)}</span>
              <span>({test.totalRatings})</span>
            </div>
          ) : null}
          {test.userAttemptCount > 0 && (
            <span>Attempted {test.userAttemptCount}x</span>
          )}
        </div>

        {/* Action Button */}
        <Button 
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = `/dashboard/tests/${test.id}`;
          }}
        >
          {test.isFree ? 'Start Test' : 'View Details'}
        </Button>
      </div>
    </div>
  );
}

function TestListItem({ test }: { test: Test }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-start gap-3">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white flex-1">
              {test.title}
            </h3>
            {!test.isFree && (
              <Lock className="w-5 h-5 text-yellow-500 flex-shrink-0" />
            )}
          </div>

          {test.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
              {test.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {test.duration} min
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <FileText className="w-3 h-3 mr-1" />
              {test.totalQuestions} Questions
            </Badge>
            <Badge variant="outline" className="text-xs capitalize">
              {test.testType}
            </Badge>

            {test.averageRating && test.totalRatings ? (
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{test.averageRating.toFixed(1)}</span>
              </div>
            ) : null}

            {test.userAttemptCount > 0 && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Attempted {test.userAttemptCount}x
              </span>
            )}
          </div>
        </div>

        <Button 
          className="bg-yellow-500 hover:bg-yellow-600 text-gray-900"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = `/dashboard/tests/${test.id}`;
          }}
        >
          {test.isFree ? 'Start Test' : 'Unlock'}
        </Button>
      </div>
    </div>
  );
}
