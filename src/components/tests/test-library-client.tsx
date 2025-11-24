'use client';

import { useState } from 'react';
import { Search, Filter, Grid, List, Lock, Clock, FileText, Globe, Star, TrendingUp, Trophy } from 'lucide-react';
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
  testType: 'mock-test' | 'sectional' | 'practice';
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
          <div className="relative w-full">{/* Search content */}
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for tests by title or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 h-12 text-base bg-background/50 border-2 focus:border-primary/50 transition-colors"
            />
          </div>

          {/* View Mode Buttons */}
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

        {/* Action Button */}
        <Button 
          className="w-full font-medium border-0"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = `/dashboard/tests/${test.id}`;
          }}
        >
          View Details
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
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
}
