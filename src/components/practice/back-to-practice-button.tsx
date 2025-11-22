'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function BackToPracticeButton() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/dashboard/practice');
    // Force refresh the page to get latest data
    router.refresh();
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleClick}>
      <ArrowLeft className="mr-2 h-4 w-4" />
      Back to Practice
    </Button>
  );
}
