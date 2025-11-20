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
      <div className="bg-card rounded-lg border shadow-sm">
        <div className="p-6 space-y-6">
          {/* Search Bar */}
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for tests by title or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 h-12 text-base bg-background/50 border-2 focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Filters Grid */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Test Type</label>
                <Select value={examTypeFilter} onValueChange={setExamTypeFilter}>
                  <SelectTrigger className="w-full h-11 bg-background/50">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="mock">Mock Test</SelectItem>
                    <SelectItem value="sectional">Sectional</SelectItem>
                    <SelectItem value="practice">Practice</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Difficulty Level</label>
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger className="w-full h-11 bg-background/50">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Duration</label>
                <Select value={durationFilter} onValueChange={setDurationFilter}>
                  <SelectTrigger className="w-full h-11 bg-background/50">
                    <SelectValue placeholder="All Durations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Durations</SelectItem>
                    <SelectItem value="30">Under 30 min</SelectItem>
                    <SelectItem value="60">30-60 min</SelectItem>
                    <SelectItem value="120">60-120 min</SelectItem>
                    <SelectItem value="180">2+ hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* View Mode Buttons - Separate Row */}
            <div className="flex items-center justify-between pt-4 border-t">
              <span className="text-sm font-medium text-muted-foreground">View Mode</span>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="min-w-[80px] sm:min-w-[80px]"
                >
                  <Grid className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Grid</span>
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="min-w-[80px] sm:min-w-[80px]"
                >
                  <List className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">List</span>
                </Button>
              </div>
            </div>

            {/* Active Filters Display */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
              <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
              {examTypeFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1 bg-secondary/10 text-secondary border-secondary/20">
                  {examTypeFilter}
                  <button
                    onClick={() => setExamTypeFilter('all')}
                    className="ml-1 hover:bg-secondary/20 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {difficultyFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1 bg-secondary/10 text-secondary border-secondary/20">
                  {difficultyFilter}
                  <button
                    onClick={() => setDifficultyFilter('all')}
                    className="ml-1 hover:bg-secondary/20 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {durationFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1 bg-secondary/10 text-secondary border-secondary/20">
                  {durationFilter === '30' ? 'Under 30 min' :
                   durationFilter === '60' ? '30-60 min' :
                   durationFilter === '120' ? '60-120 min' :
                   durationFilter === '180' ? '2+ hours' : durationFilter}
                  <button
                    onClick={() => setDurationFilter('all')}
                    className="ml-1 hover:bg-secondary/20 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="gap-1 bg-secondary/10 text-secondary border-secondary/20">
                  Search: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-1 hover:bg-secondary/20 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {(examTypeFilter !== 'all' || difficultyFilter !== 'all' || durationFilter !== 'all' || searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setExamTypeFilter('all');
                    setDifficultyFilter('all');
                    setDurationFilter('all');
                    setSearchQuery('');
                  }}
                  className="h-7 px-2 text-xs"
                >
                  Clear all
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results Count & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-muted-foreground">
        <div>
          Showing <span className="font-medium text-foreground">{filteredTests.length}</span> test{filteredTests.length !== 1 ? 's' : ''}
          {tests.length !== filteredTests.length && (
            <span> of <span className="font-medium">{tests.length}</span> total</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span>{tests.filter(t => t.isFree).length} Free</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>{tests.filter(t => !t.isFree).length} Premium</span>
          </div>
        </div>
      </div>

      {/* Test Grid/List */}
      <div>
        {/* On mobile, always show grid layout regardless of viewMode */}
        <div className="md:hidden grid grid-cols-1 gap-6">
          {filteredTests.map((test) => (
            <TestCard key={test.id} test={test} />
          ))}
        </div>

        {/* On tablet/desktop, respect viewMode */}
        <div className="hidden md:block">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
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
        </div>
      </div>

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
          <Badge className="text-xs text-primary-foreground border-0">
            <Clock className="w-3 h-3 mr-1" />
            {test.duration} min
          </Badge>
          <Badge className="text-xs text-primary-foreground border-0">
            <FileText className="w-3 h-3 mr-1" />
            {test.totalQuestions} Qs
          </Badge>
          <Badge variant="outline" className="text-xs capitalize">
            {test.testType}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4 space-y-3">
        <h3 className="font-semibold text-lg line-clamp-2 flex items-center gap-2">
          {test.title}
          {!test.isFree && (
            <Lock className="w-4 h-4 text-secondary flex-shrink-0" />
          )}
        </h3>

        {test.userAttemptCount > 0 && (
          <p className="text-sm text-secondary">
            Attempted {test.userAttemptCount}x
          </p>
        )}

        {/* Action Button */}
        <Button 
          className="w-full font-medium border-0"
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
      <div className="flex items-start gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-start gap-3">
            <h3 className="font-semibold text-lg flex-1 flex items-center gap-2">
              {test.title}
              {!test.isFree && (
                <Lock className="w-4 h-4 text-secondary flex-shrink-0" />
              )}
            </h3>
          </div>

          {test.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {test.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Badge className="text-xs text-primary-foreground border-0">
              <Clock className="w-3 h-3 mr-1" />
              {test.duration} min
            </Badge>
            <Badge className="text-xs text-primary-foreground border-0">
              <FileText className="w-3 h-3 mr-1" />
              {test.totalQuestions} Qs
            </Badge>
            <Badge variant="outline" className="text-xs capitalize">
              {test.testType}
            </Badge>

            {test.userAttemptCount > 0 && (
              <span className="text-sm text-secondary">
                Attempted {test.userAttemptCount}x
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-end h-full self-end">
          <Button 
            className="font-medium border-0 min-w-[120px]"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = `/dashboard/tests/${test.id}`;
            }}
          >
            {test.userAttemptCount > 0 ? 'View Details' : 'Start Test'}
          </Button>
        </div>
      </div>
    </div>
  );
}
