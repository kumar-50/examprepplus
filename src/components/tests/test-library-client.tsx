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
      <div className="bg-card rounded-lg p-6 space-y-4 border">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
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
      <div className="text-sm text-muted-foreground">
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
          <p className="text-muted-foreground">No tests found matching your criteria</p>
        </div>
      )}
    </div>
  );
}

function TestCard({ test }: { test: Test }) {
  return (
    <div className="bg-card rounded-lg border hover:shadow-lg transition-shadow overflow-hidden">
      {/* Header Badges */}
      <div className="p-4 flex items-start justify-between gap-2 flex-wrap">
        <div className="flex flex-wrap gap-2">
          <Badge className="text-xs bg-amber-500 hover:bg-amber-600 text-white border-0">
            <Clock className="w-3 h-3 mr-1" />
            {test.duration} min
          </Badge>
          <Badge className="text-xs bg-amber-500 hover:bg-amber-600 text-white border-0">
            <FileText className="w-3 h-3 mr-1" />
            {test.totalQuestions} Qs
          </Badge>
          <Badge variant="outline" className="text-xs capitalize">
            {test.testType}
          </Badge>
        </div>
        {!test.isFree && (
          <Lock className="w-4 h-4 text-amber-500" />
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-4 space-y-3">
        <h3 className="font-semibold text-lg line-clamp-2">
          {test.title}
        </h3>

        {test.userAttemptCount > 0 && (
          <p className="text-sm text-muted-foreground">
            Attempted {test.userAttemptCount}x
          </p>
        )}

        {/* Action Button */}
        <Button 
          className="w-full bg-amber-500 hover:bg-amber-600 text-black font-medium border-0"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = `/dashboard/tests/${test.id}`;
          }}
        >
          {test.userAttemptCount > 0 ? 'View Details' : 'Start Test'}
        </Button>
      </div>
    </div>
  );
}

function TestListItem({ test }: { test: Test }) {
  return (
    <div className="bg-card rounded-lg border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-start gap-3">
            <h3 className="font-semibold text-lg flex-1">
              {test.title}
            </h3>
            {!test.isFree && (
              <Lock className="w-5 h-5 text-amber-500 flex-shrink-0" />
            )}
          </div>

          {test.description && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {test.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Badge className="text-xs bg-amber-500 hover:bg-amber-600 text-white border-0">
              <Clock className="w-3 h-3 mr-1" />
              {test.duration} min
            </Badge>
            <Badge className="text-xs bg-amber-500 hover:bg-amber-600 text-white border-0">
              <FileText className="w-3 h-3 mr-1" />
              {test.totalQuestions} Qs
            </Badge>
            <Badge variant="outline" className="text-xs capitalize">
              {test.testType}
            </Badge>

            {test.userAttemptCount > 0 && (
              <span className="text-sm text-muted-foreground">
                Attempted {test.userAttemptCount}x
              </span>
            )}
          </div>
        </div>

        <Button 
          className="bg-amber-500 hover:bg-amber-600 text-black font-medium border-0"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = `/dashboard/tests/${test.id}`;
          }}
        >
          {test.userAttemptCount > 0 ? 'View Details' : 'Start Test'}
        </Button>
      </div>
    </div>
  );
}
