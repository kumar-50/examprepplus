/**
 * Date Range Filter Component
 * 
 * Dropdown selector for analytics date filtering
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { DateRange } from '@/lib/analytics/types';

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const dateRangeOptions = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'All time', value: 'all' },
] as const;

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const handleChange = (preset: string) => {
    onChange({
      ...value,
      preset: preset as DateRange['preset'],
    });
  };

  return (
    <Select value={value.preset} onValueChange={handleChange}>
      <SelectTrigger className="w-[180px]">
        <CalendarIcon className="mr-2 h-4 w-4" />
        <SelectValue placeholder="Select range" />
      </SelectTrigger>
      <SelectContent>
        {dateRangeOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
