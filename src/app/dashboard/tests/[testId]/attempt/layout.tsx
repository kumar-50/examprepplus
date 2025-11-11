import type { Metadata } from 'next';
import { TestAttemptWrapper } from '@/components/tests/test-attempt-wrapper';

export const metadata: Metadata = {
  title: 'Test Attempt - ExamPrepPlus',
};

// Disable all caching for test attempt pages
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function TestAttemptLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Full-page layout without sidebar for test attempts
  return <TestAttemptWrapper>{children}</TestAttemptWrapper>;
}
