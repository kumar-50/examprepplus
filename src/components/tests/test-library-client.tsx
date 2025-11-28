'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, Lock, Clock, FileText, Globe, Star, TrendingUp, Trophy, Sparkles } from 'lucide-react';
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
import { SubscriptionModal } from '@/components/subscription/subscription-modal';

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
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch subscription status
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const response = await fetch('/api/subscriptions/status');
        const data = await response.json();
        setHasActiveSubscription(data.hasActiveSubscription || false);
      } catch (error) {
        console.error('Error fetching subscription status:', error);
        setHasActiveSubscription(false);
      }
    };
    fetchSubscriptionStatus();
  }, []);

  // Filter tests based on search and filters
  const filteredTests = tests.filter((test) => {
    const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Add more filters as needed
    return matchesSearch;
  });

  // For free tier users, only show up to 3 free tests
  const FREE_TEST_LIMIT = 3;
  const freeTests = filteredTests.filter(t => t.isFree);
  const premiumTests = filteredTests.filter(t => !t.isFree);
  
  // Determine which tests to display based on subscription
  const displayTests = hasActiveSubscription 
    ? filteredTests 
    : freeTests.slice(0, FREE_TEST_LIMIT);
  
  const hiddenTestCount = hasActiveSubscription 
    ? 0 
    : (freeTests.length - FREE_TEST_LIMIT) + premiumTests.length;

  return (
    <div className="space-y-6">
      {/* Search and View Mode - Single Line */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for tests by title or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 h-12 text-base bg-background/50 border focus:border-primary/50 transition-colors"
          />
        </div>
        <div className="flex gap-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
            className="h-12 w-12"
          >
            <Grid className="w-5 h-5" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
            className="h-12 w-12"
          >
            <List className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Stats for Premium Users Only */}
      {hasActiveSubscription && (
        <div className="flex items-center justify-end gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span>{tests.filter(t => t.isFree).length} Free</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>{tests.filter(t => !t.isFree).length} Premium</span>
          </div>
        </div>
      )}

      {/* Test Grid/List */}
      <div>
        {/* On mobile, always show grid layout regardless of viewMode */}
        <div className="md:hidden grid grid-cols-1 gap-6">
          {displayTests.map((test) => (
            <TestCard key={test.id} test={test} />
          ))}
        </div>

        {/* On tablet/desktop, respect viewMode */}
        <div className="hidden md:block">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {displayTests.map((test) => (
                <TestCard key={test.id} test={test} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {displayTests.map((test) => (
                <TestListItem key={test.id} test={test} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upgrade CTA for Free Tier Users */}
      {!hasActiveSubscription && hiddenTestCount > 0 && (
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg border border-primary/20 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">Unlock More Tests</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Upgrade to Premium to access all mock tests, sectional tests, and practice quizzes with detailed analytics.
          </p>
          <Button 
            size="lg" 
            onClick={() => setIsModalOpen(true)}
            className="font-semibold"
          >
            <Lock className="w-4 h-4 mr-2" />
            Upgrade to Premium
          </Button>
        </div>
      )}

      {displayTests.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tests found matching your criteria</p>
        </div>
      )}

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        planId={null}
      />
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
