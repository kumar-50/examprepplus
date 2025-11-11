import { getTests } from '@/lib/actions/tests';
import { TestLibraryClient } from './test-library-client';

interface TestLibraryProps {
  userId: string;
}

export async function TestLibrary({ userId }: TestLibraryProps) {
  const tests = await getTests();

  return <TestLibraryClient tests={tests} />;
}
